import { OAuthException } from './oauth.exception';

export class OAuthEmailNotVerifiedException extends OAuthException {
  readonly code = 'OAUTH_EMAIL_NOT_VERIFIED';

  constructor() {
    super('OAuth provider email is not verified', 401);
  }
}
