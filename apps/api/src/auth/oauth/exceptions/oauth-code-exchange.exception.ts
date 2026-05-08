import { OAuthException } from './oauth.exception';

export class OAuthCodeExchangeException extends OAuthException {
  readonly code = 'OAUTH_CODE_EXCHANGE_FAILED';

  constructor(message = 'OAuth code exchange failed') {
    super(message, 401);
  }
}
