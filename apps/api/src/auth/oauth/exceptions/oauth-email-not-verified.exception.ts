import { UnauthorizedException } from '@nestjs/common';

export class OAuthEmailNotVerifiedException extends UnauthorizedException {
  constructor() {
    super('OAuth provider email is not verified');
  }
}
