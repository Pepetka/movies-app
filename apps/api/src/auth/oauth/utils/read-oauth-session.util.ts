import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { OAUTH_SESSION_COOKIE_NAME } from '../oauth.constants';
import type { OAuthSession } from '../types/oauth.types';

export const readOAuthSession = (request: FastifyRequest): OAuthSession => {
  const raw = request.cookies?.[OAUTH_SESSION_COOKIE_NAME];
  if (!raw) {
    throw new BadRequestException('OAuth session cookie missing');
  }

  const unsigned = request.unsignCookie(raw);
  if (!unsigned.valid || !unsigned.value) {
    throw new BadRequestException('OAuth session cookie tampered');
  }

  try {
    return JSON.parse(unsigned.value) as OAuthSession;
  } catch {
    throw new BadRequestException('OAuth session cookie invalid format');
  }
};
