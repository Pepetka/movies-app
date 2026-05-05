import type { AuthUrlParams, OAuthProfile } from '../types/oauth.types';

export interface OAuthProvider {
  readonly name: string;
  isConfigured(): boolean;
  buildAuthUrl(params: AuthUrlParams): string;
  exchangeCodeForProfile(
    code: string,
    redirectUri: string,
    codeVerifier: string,
  ): Promise<OAuthProfile>;
}
