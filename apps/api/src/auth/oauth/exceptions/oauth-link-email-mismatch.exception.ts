import { ConflictException } from '@nestjs/common';

export class OAuthLinkEmailMismatchException extends ConflictException {
  readonly code = 'OAUTH_LINK_EMAIL_MISMATCH';

  constructor() {
    super('OAuth profile email does not match account email');
  }
}
