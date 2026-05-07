import { OAuthException } from './oauth.exception';

export class UnsupportedOAuthProviderException extends OAuthException {
  readonly code = 'OAUTH_UNSUPPORTED_PROVIDER';

  constructor(providerName: string) {
    super(`Unsupported OAuth provider: ${providerName}`, 400);
  }
}
