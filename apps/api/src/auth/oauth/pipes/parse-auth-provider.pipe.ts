import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

import { AuthProvider } from '$common/enums';

import { UnsupportedOAuthProviderException } from '../exceptions';

const PROVIDERS = new Set(Object.values(AuthProvider));

/**
 * Custom pipe that validates the OAuth provider path parameter.
 *
 * We use a custom implementation instead of NestJS built-in {@link ParseEnumPipe}
 * because we need to throw {@link UnsupportedOAuthProviderException} (400)
 * rather than the generic BadRequestException produced by the default pipe.
 */
export class ParseAuthProviderPipe implements PipeTransform<
  string,
  AuthProvider
> {
  transform(value: string, _metadata: ArgumentMetadata): AuthProvider {
    if (!PROVIDERS.has(value as AuthProvider)) {
      throw new UnsupportedOAuthProviderException(value);
    }
    return value as AuthProvider;
  }
}
