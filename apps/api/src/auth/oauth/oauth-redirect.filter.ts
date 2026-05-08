import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { OAuthCookieService } from './oauth-cookie.service';
import { OAuthService } from './oauth.service';
import { OAuthException } from './exceptions';

@Catch(OAuthException)
export class OAuthRedirectExceptionFilter implements ExceptionFilter {
  private readonly _logger = new Logger(OAuthRedirectExceptionFilter.name);

  constructor(
    private readonly _oauthService: OAuthService,
    private readonly _cookieService: OAuthCookieService,
  ) {}

  catch(exception: OAuthException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const reason = this._oauthService.mapErrorToReason(exception);
    if (reason === 'oauth_failed') {
      this._logger.error('Unexpected OAuth callback error', exception);
    }

    this._cookieService.clearOAuthSessionCookie(response);
    response.redirect(this._oauthService.buildErrorUrl(reason), 302);
  }
}
