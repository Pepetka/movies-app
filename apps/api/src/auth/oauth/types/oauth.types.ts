export interface OAuthProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatar?: string | null;
}

export interface OAuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  idToken?: string;
}

export interface AuthUrlParams {
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scope?: string;
}

export type OAuthIntent = 'login' | 'link';

export interface OAuthSession {
  state: string;
  codeVerifier: string;
  intent: OAuthIntent;
  userId?: number;
}
