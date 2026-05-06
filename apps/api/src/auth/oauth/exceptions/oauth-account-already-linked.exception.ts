import { ConflictException } from '@nestjs/common';

export class OAuthAccountAlreadyLinkedException extends ConflictException {
  readonly code = 'OAUTH_ACCOUNT_ALREADY_LINKED';

  constructor() {
    super('This OAuth account is already linked to another user');
  }
}
