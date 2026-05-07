import { OAuthException } from './oauth.exception';

export class OAuthProviderNotConfiguredException extends OAuthException {
  readonly code = 'OAUTH_PROVIDER_NOT_CONFIGURED';

  constructor(providerName: string) {
    super(`OAuth provider "${providerName}" is not configured`, 503);
  }
}
