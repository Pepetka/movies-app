import { BadRequestException } from '@nestjs/common';

export class UnsupportedOAuthProviderException extends BadRequestException {
  constructor(providerName: string) {
    super(`Unsupported OAuth provider: ${providerName}`);
  }
}
