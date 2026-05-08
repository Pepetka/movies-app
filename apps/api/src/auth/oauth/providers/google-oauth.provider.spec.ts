import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import {
  OAuthCodeExchangeException,
  OAuthEmailNotVerifiedException,
} from '../exceptions';
import { GoogleOAuthProvider } from './google-oauth.provider';

const ENV = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GOOGLE_REDIRECT_URI:
    'http://localhost:8080/api/v1/auth/oauth/google/callback',
};

const REDIRECT_URI = ENV.GOOGLE_REDIRECT_URI;
const STATE = 'state-abc';
const CODE_CHALLENGE = 'challenge-xyz';
const CODE = 'auth-code';
const CODE_VERIFIER = 'verifier-xyz';

const mockProfile = {
  sub: 'google-user-123',
  email: 'oauth-test@example.com',
  email_verified: true,
  name: 'OAuth Test User',
  picture: 'https://example.com/avatar.jpg',
};

const createMockConfig = (env: Record<string, string | undefined>) => ({
  get: jest.fn((key: string) => env[key]),
  getOrThrow: jest.fn((key: string) => {
    const value = env[key];
    if (value === undefined) {
      throw new Error(`Missing env: ${key}`);
    }
    return value;
  }),
});

const okResponse = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as unknown as Response;

const errorResponse = (status: number) =>
  ({
    ok: false,
    status,
    json: async () => ({}),
  }) as unknown as Response;

describe('GoogleOAuthProvider', () => {
  let provider: GoogleOAuthProvider;
  let originalFetch: typeof global.fetch;

  async function buildProvider(
    env: Record<string, string | undefined> = ENV,
  ): Promise<GoogleOAuthProvider> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOAuthProvider,
        { provide: ConfigService, useValue: createMockConfig(env) },
      ],
    }).compile();
    return module.get<GoogleOAuthProvider>(GoogleOAuthProvider);
  }

  beforeEach(async () => {
    provider = await buildProvider();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('returns true when all env vars are present', async () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when any env var is missing', async () => {
      const partial = await buildProvider({ ...ENV, GOOGLE_CLIENT_SECRET: '' });
      expect(partial.isConfigured()).toBe(false);
    });

    it('returns false when env is empty', async () => {
      const empty = await buildProvider({});
      expect(empty.isConfigured()).toBe(false);
    });
  });

  describe('buildAuthUrl', () => {
    it('builds URL with PKCE S256, state, and OIDC scope', () => {
      const url = provider.buildAuthUrl({
        redirectUri: REDIRECT_URI,
        state: STATE,
        codeChallenge: CODE_CHALLENGE,
      });
      const parsed = new URL(url);

      expect(parsed.origin + parsed.pathname).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth',
      );
      expect(parsed.searchParams.get('client_id')).toBe(ENV.GOOGLE_CLIENT_ID);
      expect(parsed.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('scope')).toBe('openid email profile');
      expect(parsed.searchParams.get('state')).toBe(STATE);
      expect(parsed.searchParams.get('code_challenge')).toBe(CODE_CHALLENGE);
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
      expect(parsed.searchParams.get('prompt')).toBe('select_account');
    });

    it('uses custom scope when provided', () => {
      const url = provider.buildAuthUrl({
        redirectUri: REDIRECT_URI,
        state: STATE,
        codeChallenge: CODE_CHALLENGE,
        scope: 'openid',
      });
      expect(new URL(url).searchParams.get('scope')).toBe('openid');
    });
  });

  describe('exchangeCodeForProfile', () => {
    it('returns normalized profile on success', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(okResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(okResponse(mockProfile));
      global.fetch = fetchMock as unknown as typeof global.fetch;

      const result = await provider.exchangeCodeForProfile(
        CODE,
        REDIRECT_URI,
        CODE_VERIFIER,
      );

      expect(result).toEqual({
        id: 'google-user-123',
        email: 'oauth-test@example.com',
        emailVerified: true,
        name: 'OAuth Test User',
        avatar: 'https://example.com/avatar.jpg',
      });

      const tokenCall = fetchMock.mock.calls[0];
      expect(tokenCall[0]).toBe('https://oauth2.googleapis.com/token');
      const body = tokenCall[1].body as URLSearchParams;
      expect(body).toBeInstanceOf(URLSearchParams);
      expect(body.get('code')).toBe(CODE);
      expect(body.get('code_verifier')).toBe(CODE_VERIFIER);
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('redirect_uri')).toBe(REDIRECT_URI);
    });

    it('falls back to email local-part when name is missing', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(okResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(
          okResponse({ ...mockProfile, name: undefined }),
        ) as unknown as typeof global.fetch;

      const result = await provider.exchangeCodeForProfile(
        CODE,
        REDIRECT_URI,
        CODE_VERIFIER,
      );
      expect(result.name).toBe('oauth-test');
    });

    it('lowercases and trims provider email', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(okResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(
          okResponse({ ...mockProfile, email: '  USER@Example.COM  ' }),
        ) as unknown as typeof global.fetch;

      const result = await provider.exchangeCodeForProfile(
        CODE,
        REDIRECT_URI,
        CODE_VERIFIER,
      );
      expect(result.email).toBe('user@example.com');
    });

    it('throws OAuthEmailNotVerifiedException when email_verified is false', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(okResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(
          okResponse({ ...mockProfile, email_verified: false }),
        ) as unknown as typeof global.fetch;

      await expect(
        provider.exchangeCodeForProfile(CODE, REDIRECT_URI, CODE_VERIFIER),
      ).rejects.toThrow(OAuthEmailNotVerifiedException);
    });

    it('throws OAuthCodeExchangeException when token endpoint fails', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(
          errorResponse(400),
        ) as unknown as typeof global.fetch;

      await expect(
        provider.exchangeCodeForProfile(CODE, REDIRECT_URI, CODE_VERIFIER),
      ).rejects.toThrow(OAuthCodeExchangeException);
    });

    it('throws OAuthCodeExchangeException when userinfo endpoint fails', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(okResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(
          errorResponse(401),
        ) as unknown as typeof global.fetch;

      await expect(
        provider.exchangeCodeForProfile(CODE, REDIRECT_URI, CODE_VERIFIER),
      ).rejects.toThrow(OAuthCodeExchangeException);
    });
  });
});
