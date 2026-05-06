import { UnauthorizedException } from '@nestjs/common';

export class OAuthCodeExchangeException extends UnauthorizedException {
  readonly code = 'OAUTH_CODE_EXCHANGE_FAILED';

  constructor(message = 'OAuth code exchange failed') {
    super(message);
  }
}
