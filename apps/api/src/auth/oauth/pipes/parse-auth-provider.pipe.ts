import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

import { AuthProvider } from '$common/enums';

import { UnsupportedOAuthProviderException } from '../exceptions';

const PROVIDERS = new Set(Object.values(AuthProvider));

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
