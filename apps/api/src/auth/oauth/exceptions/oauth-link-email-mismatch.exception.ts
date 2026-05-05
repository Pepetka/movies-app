import { ConflictException } from '@nestjs/common';

export class OAuthLinkEmailMismatchException extends ConflictException {
  constructor() {
    super('OAuth profile email does not match account email');
  }
}
