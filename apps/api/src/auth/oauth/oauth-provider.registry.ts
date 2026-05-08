import { Inject, Injectable } from '@nestjs/common';

import { AuthProvider } from '$common/enums';

import {
  OAuthProviderNotConfiguredException,
  UnsupportedOAuthProviderException,
} from './exceptions';
import type { OAuthProvider } from './interfaces/oauth-provider.interface';
import { OAUTH_PROVIDERS } from './oauth.constants';

@Injectable()
export class OAuthProviderRegistry {
  private readonly _providers = new Map<string, OAuthProvider>();

  constructor(@Inject(OAUTH_PROVIDERS) providers: OAuthProvider[]) {
    for (const provider of providers) {
      this._providers.set(provider.name, provider);
    }
  }

  /**
   * Returns the provider implementation for the given name.
   *
   * @throws UnsupportedOAuthProviderException (400) if no provider is registered under that name
   * @throws OAuthProviderNotConfiguredException (503) if the provider exists but env is missing
   */
  get(name: AuthProvider): OAuthProvider {
    const provider = this._providers.get(name);
    if (!provider) {
      throw new UnsupportedOAuthProviderException(name);
    }
    if (!provider.isConfigured()) {
      throw new OAuthProviderNotConfiguredException(name);
    }
    return provider;
  }
}
