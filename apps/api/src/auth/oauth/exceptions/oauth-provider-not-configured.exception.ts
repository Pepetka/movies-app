import { HttpException, HttpStatus } from '@nestjs/common';

export class OAuthProviderNotConfiguredException extends HttpException {
  readonly code = 'OAUTH_PROVIDER_NOT_CONFIGURED';

  constructor(providerName: string) {
    super(
      `OAuth provider "${providerName}" is not configured`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
