import type { FastifyReply, FastifyRequest } from 'fastify';
import { Inject, Injectable } from '@nestjs/common';

import {
  OAUTH_SESSION_COOKIE_NAME,
  OAUTH_SESSION_COOKIE_MAX_AGE,
  OAUTH_SESSION_COOKIE_PATH,
} from './oauth.constants';
import {
  RefreshCookieOptions,
  REFRESH_COOKIE_OPTIONS,
} from '../auth.constants';
import { readOAuthSession } from './utils/read-oauth-session.util';
import type { OAuthSession } from './types/oauth.types';

@Injectable()
export class OAuthCookieService {
  constructor(
    @Inject(REFRESH_COOKIE_OPTIONS)
    private readonly _cookieOptions: RefreshCookieOptions,
  ) {}

  setOAuthSessionCookie(reply: FastifyReply, session: OAuthSession): void {
    reply.cookie(OAUTH_SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      signed: true,
      secure: this._cookieOptions.secure,
      sameSite: 'lax',
      path: OAUTH_SESSION_COOKIE_PATH,
      maxAge: OAUTH_SESSION_COOKIE_MAX_AGE,
    });
  }

  clearOAuthSessionCookie(reply: FastifyReply): void {
    reply.clearCookie(OAUTH_SESSION_COOKIE_NAME, {
      path: OAUTH_SESSION_COOKIE_PATH,
      sameSite: 'lax',
      secure: this._cookieOptions.secure,
    });
  }

  readOAuthSession(request: FastifyRequest): OAuthSession {
    return readOAuthSession(request);
  }
}
