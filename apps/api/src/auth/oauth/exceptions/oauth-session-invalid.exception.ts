import { OAuthException } from './oauth.exception';

export class OAuthSessionInvalidException extends OAuthException {
  readonly code = 'OAUTH_SESSION_INVALID';

  constructor(message = 'OAuth session is invalid or expired') {
    super(message, 400);
  }
}
