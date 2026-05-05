import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { DrizzleDb, DrizzleTx } from '$db/types/drizzle.types';
import { UserRepository } from '$src/user/user.repository';
import type { AuthProvider, User } from '$db/schemas';
import { UserService } from '$src/user/user.service';
import { AuthService } from '$src/auth/auth.service';
import { DRIZZLE } from '$db/db.module';

import {
  OAuthAccountAlreadyLinkedException,
  OAuthCodeExchangeException,
  OAuthEmailNotVerifiedException,
  OAuthLinkEmailMismatchException,
  OAuthProviderNotConfiguredException,
  UnsupportedOAuthProviderException,
} from './exceptions';
import { OAuthAccountRepository } from './oauth-account.repository';
import { OAuthProviderRegistry } from './oauth-provider.registry';
import type { OAuthProfile } from './types/oauth.types';
import { OAUTH_ERROR_PATH } from './oauth.constants';

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
    private readonly userRepository: UserRepository,
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

    const user = await this.db.transaction((tx) =>
      this._findOrCreateUser(tx, provider, profile),
    );

    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.role,
    );
    const tokenHash = await this.userService.hashToken(tokens.refreshToken);

    await this.db.transaction(async (tx) => {
      await this.userService.updateRefreshTokenHash(user.id, tokenHash, tx);
    });

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
      const user = await this.userRepository.findById(userId, tx);
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
      const user = await this.userRepository.findById(
        existingAccount.userId,
        tx,
      );
      if (!user) {
        throw new Error(
          `OAuth account ${existingAccount.id} references missing user ${existingAccount.userId}`,
        );
      }
      return user;
    }

    // Require verified email only for new account creation/linking.
    // Previously linked accounts are trusted (returned above).
    if (!profile.emailVerified) {
      throw new OAuthEmailNotVerifiedException();
    }

    let user = await this.userRepository.findByEmail(profile.email, tx);

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
   * Returns the primary web URL from the comma-separated WEB_URL env var.
   */
  getPrimaryWebUrl(): string {
    return this.configService
      .getOrThrow<string>('WEB_URL')
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
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
   * Looks up the redirect URI for the given provider via env var
   * `${PROVIDER_UPPERCASE}_REDIRECT_URI`. Throws 501 if not configured.
   */
  private _getRedirectUri(provider: AuthProvider): string {
    const key = `${provider.toUpperCase()}_REDIRECT_URI`;
    const uri = this.configService.get<string>(key);
    if (!uri) {
      throw new OAuthProviderNotConfiguredException(provider);
    }
    return uri;
  }
}
