import { ConflictException } from '@nestjs/common';

export class OAuthAccountAlreadyLinkedException extends ConflictException {
  constructor() {
    super('This OAuth account is already linked to another user');
  }
}
