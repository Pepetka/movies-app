import { UnauthorizedException } from '@nestjs/common';

export class OAuthEmailNotVerifiedException extends UnauthorizedException {
  readonly code = 'OAUTH_EMAIL_NOT_VERIFIED';

  constructor() {
    super('OAuth provider email is not verified');
  }
}
