import type { FastifyRequest } from 'fastify';

import { OAUTH_SESSION_COOKIE_NAME } from '../oauth.constants';
import { OAuthSessionInvalidException } from '../exceptions';
import type { OAuthSession } from '../types/oauth.types';

export const readOAuthSession = (request: FastifyRequest): OAuthSession => {
  const raw = request.cookies?.[OAUTH_SESSION_COOKIE_NAME];
  if (!raw) {
    throw new OAuthSessionInvalidException('OAuth session cookie missing');
  }

  const unsigned = request.unsignCookie(raw);
  if (!unsigned.valid || !unsigned.value) {
    throw new OAuthSessionInvalidException('OAuth session cookie tampered');
  }

  try {
    const parsed = JSON.parse(unsigned.value);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.state !== 'string' ||
      typeof parsed.codeVerifier !== 'string' ||
      typeof parsed.intent !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      throw new OAuthSessionInvalidException(
        'OAuth session cookie invalid format',
      );
    }
    const session = parsed as OAuthSession;
    if (session.expiresAt < Date.now()) {
      throw new OAuthSessionInvalidException('OAuth session expired');
    }
    return session;
  } catch {
    throw new OAuthSessionInvalidException(
      'OAuth session cookie invalid format',
    );
  }
};
