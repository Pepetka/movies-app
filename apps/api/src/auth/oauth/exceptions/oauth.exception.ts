import { HttpException } from '@nestjs/common';

/**
 * Base class for all OAuth-specific exceptions.
 * Used to distinguish OAuth flow errors from generic HTTP exceptions
 * in the OAuthRedirectExceptionFilter.
 */
export abstract class OAuthException extends HttpException {
  abstract readonly code: string;
}
