import { OAuthException } from './oauth.exception';

export class OAuthLinkEmailMismatchException extends OAuthException {
  readonly code = 'OAUTH_LINK_EMAIL_MISMATCH';

  constructor() {
    super('OAuth profile email does not match account email', 409);
  }
}
