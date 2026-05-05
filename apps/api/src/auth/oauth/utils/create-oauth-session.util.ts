import { createHash, randomBytes } from 'crypto';

import type { OAuthIntent, OAuthSession } from '../types/oauth.types';

export interface OAuthSessionInit {
  session: OAuthSession;
  codeChallenge: string;
}

function isSafeRedirect(redirect: string): boolean {
  return redirect.startsWith('/') && !redirect.startsWith('//');
}

/**
 * Creates a fresh OAuth session payload with PKCE (S256) primitives.
 *
 * - `state` (32 random bytes, base64url) — CSRF protection on the OAuth flow.
 * - `codeVerifier` (64 random bytes, base64url) — kept server-side until callback.
 * - `codeChallenge` — `SHA256(codeVerifier)` in base64url, sent to the provider.
 *
 * @param intent - 'login' for new sessions, 'link' for attaching to a logged-in user
 * @param userId - required when `intent === 'link'`
 * @param redirect - optional safe redirect path (validated: must start with '/' and not '//')
 * @throws Error when `intent === 'link'` and `userId` is missing
 */
export function createOAuthSession(
  intent: OAuthIntent = 'login',
  userId?: number,
  redirect?: string,
): OAuthSessionInit {
  if (intent === 'link' && userId == null) {
    throw new Error('createOAuthSession: userId is required for intent=link');
  }

  const state = randomBytes(32).toString('base64url');
  const codeVerifier = randomBytes(64).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const session: OAuthSession = { state, codeVerifier, intent, userId };
  if (redirect && isSafeRedirect(redirect)) {
    session.redirect = redirect;
  }

  return {
    session,
    codeChallenge,
  };
}
