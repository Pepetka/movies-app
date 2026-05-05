import { Test, TestingModule } from '@nestjs/testing';

import type { AuthProvider } from '$db/schemas';

import {
  OAuthProviderNotConfiguredException,
  UnsupportedOAuthProviderException,
} from './exceptions';
import { OAuthProviderRegistry } from './oauth-provider.registry';
import { OAUTH_PROVIDERS } from './oauth.constants';

const createGoogleMock = (configured: boolean) => ({
  name: 'google',
  isConfigured: jest.fn(() => configured),
  buildAuthUrl: jest.fn(),
  exchangeCodeForProfile: jest.fn(),
});

describe('OAuthProviderRegistry', () => {
  async function buildRegistry(googleConfigured: boolean) {
    const googleMock = createGoogleMock(googleConfigured);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthProviderRegistry,
        { provide: OAUTH_PROVIDERS, useValue: [googleMock] },
      ],
    }).compile();

    return {
      registry: module.get<OAuthProviderRegistry>(OAuthProviderRegistry),
      googleMock,
    };
  }

  it('returns the configured google provider', async () => {
    const { registry, googleMock } = await buildRegistry(true);
    const provider = registry.get('google');
    expect(provider).toBe(googleMock);
  });

  it('throws UnsupportedOAuthProviderException for unknown provider', async () => {
    const { registry } = await buildRegistry(true);
    expect(() => registry.get('unknown' as AuthProvider)).toThrow(
      UnsupportedOAuthProviderException,
    );
  });

  it('throws OAuthProviderNotConfiguredException when env is missing', async () => {
    const { registry } = await buildRegistry(false);
    expect(() => registry.get('google')).toThrow(
      OAuthProviderNotConfiguredException,
    );
  });
});
