import { BadRequestException } from '@nestjs/common';

export class UnsupportedOAuthProviderException extends BadRequestException {
  readonly code = 'OAUTH_UNSUPPORTED_PROVIDER';

  constructor(providerName: string) {
    super(`Unsupported OAuth provider: ${providerName}`);
  }
}
