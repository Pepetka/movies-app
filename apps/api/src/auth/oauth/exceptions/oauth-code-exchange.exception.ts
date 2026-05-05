import { UnauthorizedException } from '@nestjs/common';

export class OAuthCodeExchangeException extends UnauthorizedException {
  constructor(message = 'OAuth code exchange failed') {
    super(message);
  }
}
