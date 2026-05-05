import { HttpException, HttpStatus } from '@nestjs/common';

export class OAuthProviderNotConfiguredException extends HttpException {
  constructor(providerName: string) {
    super(
      `OAuth provider "${providerName}" is not configured`,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
