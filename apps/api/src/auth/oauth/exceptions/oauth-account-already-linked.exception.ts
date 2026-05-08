import { OAuthException } from './oauth.exception';

export class OAuthAccountAlreadyLinkedException extends OAuthException {
  readonly code = 'OAUTH_ACCOUNT_ALREADY_LINKED';

  constructor() {
    super('This OAuth account is already linked to another user', 409);
  }
}
