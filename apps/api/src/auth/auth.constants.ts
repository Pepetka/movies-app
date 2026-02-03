export interface RefreshCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
}

export const REFRESH_COOKIE_OPTIONS = Symbol('REFRESH_COOKIE_OPTIONS');
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';
