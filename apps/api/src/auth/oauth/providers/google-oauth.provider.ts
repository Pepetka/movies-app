import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  OAuthCodeExchangeException,
  OAuthEmailNotVerifiedException,
} from '../exceptions';
import type { OAuthProvider } from '../interfaces/oauth-provider.interface';
import type { AuthUrlParams, OAuthProfile } from '../types/oauth.types';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const DEFAULT_SCOPE = 'openid email profile';
const REQUEST_TIMEOUT_MS = 10_000;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleOAuthProvider implements OAuthProvider {
  readonly name = 'google';
  private readonly _logger = new Logger(GoogleOAuthProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('GOOGLE_CLIENT_ID') &&
      this.configService.get<string>('GOOGLE_CLIENT_SECRET') &&
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  /**
   * Builds Google's OAuth 2.1 authorization URL with PKCE (S256).
   */
  buildAuthUrl({
    redirectUri,
    state,
    codeChallenge,
    scope,
  }: AuthUrlParams): string {
    const url = new URL(AUTH_URL);
    url.searchParams.set('client_id', this._getClientId());
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope ?? DEFAULT_SCOPE);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('prompt', 'select_account');
    return url.toString();
  }

  /**
   * Exchanges authorization code for an OIDC userinfo profile.
   *
   * @throws OAuthCodeExchangeException if token or userinfo endpoint fails
   * @throws OAuthEmailNotVerifiedException if Google reports `email_verified: false`
   */
  async exchangeCodeForProfile(
    code: string,
    redirectUri: string,
    codeVerifier: string,
  ): Promise<OAuthProfile> {
    const tokenAbort = new AbortController();
    const tokenTimeout = setTimeout(
      () => tokenAbort.abort(),
      REQUEST_TIMEOUT_MS,
    );
    let userInfoTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const tokenResponse = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: tokenAbort.signal,
        body: new URLSearchParams({
          code,
          client_id: this._getClientId(),
          client_secret: this._getClientSecret(),
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        this._logger.warn(
          `Google token exchange failed: status=${tokenResponse.status}`,
        );
        throw new OAuthCodeExchangeException(
          `Google token exchange failed: ${tokenResponse.status}`,
        );
      }

      const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

      clearTimeout(tokenTimeout);
      const userInfoAbort = new AbortController();
      userInfoTimeout = setTimeout(
        () => userInfoAbort.abort(),
        REQUEST_TIMEOUT_MS,
      );

      const userResponse = await fetch(USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        signal: userInfoAbort.signal,
      });

      clearTimeout(userInfoTimeout);

      if (!userResponse.ok) {
        this._logger.warn(
          `Google userinfo failed: status=${userResponse.status}`,
        );
        throw new OAuthCodeExchangeException(
          `Google userinfo failed: ${userResponse.status}`,
        );
      }

      const userData = (await userResponse.json()) as GoogleUserInfo;

      if (!userData.email_verified) {
        throw new OAuthEmailNotVerifiedException();
      }

      const normalizedEmail = userData.email.toLowerCase().trim();

      return {
        id: userData.sub,
        email: normalizedEmail,
        emailVerified: userData.email_verified,
        name: userData.name?.trim() || normalizedEmail.split('@')[0],
        avatar: userData.picture ?? null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this._logger.error('Google OAuth request timed out');
        throw new OAuthCodeExchangeException(
          'Google token/userinfo request timed out',
        );
      }
      throw error;
    } finally {
      clearTimeout(tokenTimeout);
      if (userInfoTimeout) {
        clearTimeout(userInfoTimeout);
      }
    }
  }

  private _getClientId(): string {
    return this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
  }

  private _getClientSecret(): string {
    return this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
  }
}
