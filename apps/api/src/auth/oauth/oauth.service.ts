import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { DrizzleDb, DrizzleTx } from '$db/types/drizzle.types';
import type { AuthProvider, User } from '$db/schemas';
import { UserService } from '$src/user/user.service';
import { AuthService } from '$src/auth/auth.service';
import { parsePrimaryWebUrl } from '$common/utils';
import { DRIZZLE } from '$db/db.module';

import {
  OAuthAccountAlreadyLinkedException,
  OAuthCodeExchangeException,
  OAuthEmailNotVerifiedException,
  OAuthLinkEmailMismatchException,
  OAuthProviderNotConfiguredException,
  UnsupportedOAuthProviderException,
} from './exceptions';
import {
  OAUTH_ERROR_PATH,
  OAUTH_LINK_SUCCESS_PATH,
  OAUTH_SUCCESS_PATH,
} from './oauth.constants';
import type { OAuthProfile, OAuthSession } from './types/oauth.types';
import { OAuthAccountRepository } from './oauth-account.repository';
import { OAuthProviderRegistry } from './oauth-provider.registry';

export interface OAuthCallbackResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable()
export class OAuthService {
  private readonly _logger = new Logger(OAuthService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly providerRegistry: OAuthProviderRegistry,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Builds the provider authorization URL for the given OAuth flow.
   *
   * @throws UnsupportedOAuthProviderException (400) if provider name is unknown
   * @throws OAuthProviderNotConfiguredException (501) if provider env is missing
   */
  buildAuthUrl(
    provider: AuthProvider,
    state: string,
    codeChallenge: string,
  ): string {
    const impl = this.providerRegistry.get(provider);
    const redirectUri = this._getRedirectUri(provider);
    return impl.buildAuthUrl({ redirectUri, state, codeChallenge });
  }

  /**
   * Handles the OAuth login callback: exchanges code, finds or creates the user
   * (transactionally), then issues JWT tokens and stores the refresh token hash.
   *
   * @throws OAuthCodeExchangeException (401) if provider rejects the code
   * @throws OAuthEmailNotVerifiedException (401) if the provider email is unverified
   */
  async handleCallback(
    provider: AuthProvider,
    code: string,
    codeVerifier: string,
  ): Promise<OAuthCallbackResult> {
    const impl = this.providerRegistry.get(provider);
    const redirectUri = this._getRedirectUri(provider);

    this._logger.log(`Processing OAuth callback for ${provider}`);

    const profile = await impl.exchangeCodeForProfile(
      code,
      redirectUri,
      codeVerifier,
    );

    const user = await this.db.transaction(async (tx) => {
      return this._findOrCreateUser(tx, provider, profile);
    });

    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.role,
    );
    const tokenHash = await this.userService.hashToken(tokens.refreshToken);

    await this.userService.updateRefreshTokenHash(user.id, tokenHash);

    this._logger.log(
      `OAuth login successful: userId=${user.id}, provider=${provider}`,
    );

    return { ...tokens, user };
  }

  /**
   * Attaches an OAuth provider to an already-authenticated user.
   *
   * Checks email match and prevents linking to another user's account.
   * Idempotent: linking the same provider account to the same user is a no-op.
   *
   * @throws NotFoundException if user does not exist
   * @throws OAuthLinkEmailMismatchException if profile email differs from user's email
   * @throws OAuthAccountAlreadyLinkedException if account is linked to another user
   * @throws OAuthEmailNotVerifiedException if provider email is unverified
   */
  async linkProvider(
    userId: number,
    provider: AuthProvider,
    code: string,
    codeVerifier: string,
  ): Promise<User> {
    const impl = this.providerRegistry.get(provider);
    const redirectUri = this._getRedirectUri(provider);

    const profile = await impl.exchangeCodeForProfile(
      code,
      redirectUri,
      codeVerifier,
    );

    return this.db.transaction(async (tx) => {
      const user = await this.userService.findById(userId, tx);
      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      if (profile.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new OAuthLinkEmailMismatchException();
      }

      const existing = await this.oauthAccountRepository.findByProviderAccount(
        provider,
        profile.id,
        tx,
      );

      if (existing && existing.userId !== userId) {
        this._logger.warn(
          `OAuth account collision: provider=${provider}, ` +
            `ownerId=${existing.userId}, attemptId=${userId}`,
        );
        throw new OAuthAccountAlreadyLinkedException();
      }

      if (existing && existing.userId === userId) {
        this._logger.debug(
          `OAuth already linked: userId=${userId}, provider=${provider}`,
        );
        return user;
      }

      await this.oauthAccountRepository.create(
        {
          userId,
          provider,
          providerAccountId: profile.id,
          avatar: profile.avatar ?? null,
        },
        tx,
      );

      this._logger.log(`OAuth linked: userId=${userId}, provider=${provider}`);
      return user;
    });
  }

  /**
   * Transactional find-or-create:
   * 1) Existing `oauth_accounts` (provider, providerAccountId) → return that user.
   * 2) Existing `users` by email → auto-link a new oauth_accounts row.
   * 3) No match → create user via `UserService.createOAuthUser` + new oauth_accounts row.
   */
  private async _findOrCreateUser(
    tx: DrizzleTx,
    provider: AuthProvider,
    profile: OAuthProfile,
  ): Promise<User> {
    const existingAccount =
      await this.oauthAccountRepository.findByProviderAccount(
        provider,
        profile.id,
        tx,
      );

    if (existingAccount) {
      this._logger.debug(
        `Existing OAuth account: ${existingAccount.id}, provider=${provider}`,
      );
      const user = await this.userService.findById(existingAccount.userId, tx);
      if (!user) {
        this._logger.error(
          `OAuth account ${existingAccount.id} references missing user ${existingAccount.userId}`,
        );
        throw new InternalServerErrorException('Data integrity error');
      }
      return user;
    }

    // Require verified email only for new account creation/linking.
    // Previously linked accounts are trusted (returned above).
    if (!profile.emailVerified) {
      throw new OAuthEmailNotVerifiedException();
    }

    let user = await this.userService.findByEmail(profile.email, tx);

    if (user) {
      this._logger.log(
        `Linking OAuth to existing user: ${user.id}, email prefix=${profile.email.slice(0, 3)}***`,
      );
    } else {
      this._logger.log(
        `Creating new user from OAuth: email prefix=${profile.email.slice(0, 3)}***`,
      );
      user = await this.userService.createOAuthUser(
        {
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar ?? null,
        },
        tx,
      );
    }

    await this.oauthAccountRepository.create(
      {
        userId: user.id,
        provider,
        providerAccountId: profile.id,
        avatar: profile.avatar ?? null,
      },
      tx,
    );

    return user;
  }

  /**
   * Maps an OAuth error exception to a machine-readable reason string
   * used for SPA redirect query parameters.
   */
  mapErrorToReason(error: unknown): string {
    if (error instanceof OAuthEmailNotVerifiedException) {
      return 'oauth_email_unverified';
    }
    if (error instanceof OAuthCodeExchangeException) {
      return 'oauth_code_exchange_failed';
    }
    if (error instanceof OAuthProviderNotConfiguredException) {
      return 'oauth_provider_not_configured';
    }
    if (error instanceof UnsupportedOAuthProviderException) {
      return 'oauth_unsupported_provider';
    }
    if (error instanceof OAuthLinkEmailMismatchException) {
      return 'oauth_link_email_mismatch';
    }
    if (error instanceof OAuthAccountAlreadyLinkedException) {
      return 'oauth_account_already_linked';
    }
    return 'oauth_failed';
  }

  /**
   * Processes an OAuth callback request: validates query params,
   * dispatches by session intent, and returns the redirect URL.
   *
   * @returns Object with redirectUrl and optional refreshToken (for login intent)
   */
  async processCallback(
    provider: AuthProvider,
    query: { code?: string; error?: string },
    session: OAuthSession,
  ): Promise<{ redirectUrl: string; refreshToken?: string }> {
    if (query.error) {
      return { redirectUrl: this.buildErrorUrl(query.error) };
    }
    if (!query.code) {
      return { redirectUrl: this.buildErrorUrl('missing_code') };
    }

    if (session.intent === 'login') {
      const result = await this.handleCallback(
        provider,
        query.code,
        session.codeVerifier,
      );
      const webUrl = this.getPrimaryWebUrl();
      const successUrl = new URL(`${webUrl}${OAUTH_SUCCESS_PATH}`);
      if (session.redirect) {
        successUrl.searchParams.set('redirect', session.redirect);
      }
      return {
        redirectUrl: successUrl.toString(),
        refreshToken: result.refreshToken,
      };
    }

    if (session.intent === 'link') {
      if (!session.userId) {
        return { redirectUrl: this.buildErrorUrl('invalid_session') };
      }
      await this.linkProvider(
        session.userId,
        provider,
        query.code,
        session.codeVerifier,
      );
      const webUrl = this.getPrimaryWebUrl();
      return { redirectUrl: `${webUrl}${OAUTH_LINK_SUCCESS_PATH}` };
    }

    return { redirectUrl: this.buildErrorUrl('invalid_intent') };
  }

  /**
   * Returns the primary web URL from the comma-separated WEB_URL env var.
   */
  getPrimaryWebUrl(): string {
    return parsePrimaryWebUrl(this.configService.getOrThrow<string>('WEB_URL'));
  }

  /**
   * Builds the full SPA redirect URL for OAuth errors.
   */
  buildErrorUrl(reason: string): string {
    const webUrl = this.getPrimaryWebUrl();
    const url = new URL(`${webUrl}${OAUTH_ERROR_PATH}`);
    url.searchParams.set('reason', reason);
    return url.toString();
  }

  /**
   * Maps provider name to env variable prefix.
   */
  private _getProviderEnvPrefix(provider: AuthProvider): string {
    const mapping: Record<AuthProvider, string> = {
      google: 'GOOGLE',
    };
    return mapping[provider];
  }

  /**
   * Looks up the redirect URI for the given provider via env var
   * `${PROVIDER_PREFIX}_REDIRECT_URI`. Throws 501 if not configured.
   */
  private _getRedirectUri(provider: AuthProvider): string {
    const envPrefix = this._getProviderEnvPrefix(provider);
    const key = `${envPrefix}_REDIRECT_URI`;
    const uri = this.configService.get<string>(key);
    if (!uri) {
      throw new OAuthProviderNotConfiguredException(provider);
    }
    return uri;
  }
}
