import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { authProviderEnum, type AuthProvider } from '$db/schemas';

import { UnsupportedOAuthProviderException } from '../exceptions';

@Injectable()
export class ParseAuthProviderPipe implements PipeTransform<
  string,
  AuthProvider
> {
  transform(value: string, _metadata: ArgumentMetadata): AuthProvider {
    if (![...authProviderEnum.enumValues].includes(value as AuthProvider)) {
      throw new UnsupportedOAuthProviderException(value);
    }
    return value as AuthProvider;
  }
}
