import { ServiceUnavailableException } from '@nestjs/common';

export class OAuthProviderNotConfiguredException extends ServiceUnavailableException {
  readonly code = 'OAUTH_PROVIDER_NOT_CONFIGURED';

  constructor(providerName: string) {
    super(`OAuth provider "${providerName}" is not configured`);
  }
}
