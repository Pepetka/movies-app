import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserService } from '$src/user/user.service';
import { UserRole } from '$common/enums';
import { DRIZZLE } from '$db/db.module';

import {
  OAuthAccountAlreadyLinkedException,
  OAuthCodeExchangeException,
  OAuthEmailNotVerifiedException,
  OAuthLinkEmailMismatchException,
  OAuthProviderNotConfiguredException,
} from './exceptions';
import { OAuthAccountRepository } from './oauth-account.repository';
import { OAuthProviderRegistry } from './oauth-provider.registry';
import { OAuthService } from './oauth.service';
import { AuthService } from '../auth.service';

const TX_SENTINEL = { __tx: true } as unknown;
const REDIRECT_URI = 'http://localhost:8080/api/v1/auth/oauth/google/callback';
const CODE = 'auth-code';
const CODE_VERIFIER = 'verifier-xyz';

const mockUser = {
  id: 1,
  email: 'oauth-test@example.com',
  name: 'OAuth Test User',
  passwordHash: null,
  role: UserRole.USER,
  refreshTokenHash: null,
  avatar: 'https://example.com/avatar.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOAuthAccount = {
  id: 10,
  userId: mockUser.id,
  provider: 'google' as const,
  providerAccountId: 'google-user-123',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile = {
  id: 'google-user-123',
  email: 'oauth-test@example.com',
  emailVerified: true,
  name: 'OAuth Test User',
  avatar: 'https://example.com/avatar.jpg',
};

const mockTokens = {
  accessToken: 'mock-access',
  refreshToken: 'mock-refresh',
};

describe('OAuthService', () => {
  let service: OAuthService;
  let providerRegistry: { get: jest.Mock };
  let oauthAccountRepository: {
    findByProviderAccount: jest.Mock;
    create: jest.Mock;
  };
  let userService: {
    findById: jest.Mock;
    findByEmail: jest.Mock;
    createOAuthUser: jest.Mock;
    hashToken: jest.Mock;
    updateRefreshTokenHash: jest.Mock;
  };
  let authService: { generateTokens: jest.Mock };
  let providerImpl: {
    buildAuthUrl: jest.Mock;
    exchangeCodeForProfile: jest.Mock;
  };
  let db: { transaction: jest.Mock };

  beforeEach(async () => {
    providerImpl = {
      buildAuthUrl: jest
        .fn()
        .mockReturnValue('https://accounts.google.com/...'),
      exchangeCodeForProfile: jest.fn().mockResolvedValue(mockProfile),
    };
    providerRegistry = { get: jest.fn().mockReturnValue(providerImpl) };
    oauthAccountRepository = {
      findByProviderAccount: jest.fn(),
      create: jest.fn().mockResolvedValue(mockOAuthAccount),
    };
    userService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      createOAuthUser: jest.fn(),
      hashToken: jest.fn().mockResolvedValue('hashed-refresh'),
      updateRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
    };
    authService = {
      generateTokens: jest.fn().mockResolvedValue(mockTokens),
    };
    db = {
      transaction: jest.fn(async (cb: (tx: unknown) => unknown) =>
        cb(TX_SENTINEL),
      ),
    };

    const config = {
      get: jest.fn((key: string) =>
        key === 'GOOGLE_REDIRECT_URI' ? REDIRECT_URI : undefined,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: DRIZZLE, useValue: db },
        { provide: OAuthProviderRegistry, useValue: providerRegistry },
        { provide: OAuthAccountRepository, useValue: oauthAccountRepository },
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('buildAuthUrl', () => {
    it('delegates to the provider with the resolved redirect URI', () => {
      const result = service.buildAuthUrl('google', 'state-1', 'challenge-1');
      expect(result).toBe('https://accounts.google.com/...');
      expect(providerRegistry.get).toHaveBeenCalledWith('google');
      expect(providerImpl.buildAuthUrl).toHaveBeenCalledWith({
        redirectUri: REDIRECT_URI,
        state: 'state-1',
        codeChallenge: 'challenge-1',
      });
    });

    it('throws OAuthProviderNotConfiguredException when redirect URI is missing', async () => {
      const config = { get: jest.fn().mockReturnValue(undefined) };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OAuthService,
          { provide: DRIZZLE, useValue: db },
          { provide: OAuthProviderRegistry, useValue: providerRegistry },
          { provide: OAuthAccountRepository, useValue: oauthAccountRepository },
          { provide: UserService, useValue: userService },
          { provide: AuthService, useValue: authService },
          { provide: ConfigService, useValue: config },
        ],
      }).compile();
      const noUriService = module.get<OAuthService>(OAuthService);

      expect(() =>
        noUriService.buildAuthUrl('google', 'state', 'challenge'),
      ).toThrow(OAuthProviderNotConfiguredException);
    });
  });

  describe('handleCallback', () => {
    it('returns existing user when oauth_accounts row exists, without inserting', async () => {
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(
        mockOAuthAccount,
      );
      userService.findById.mockResolvedValue(mockUser);

      const result = await service.handleCallback(
        'google',
        CODE,
        CODE_VERIFIER,
      );

      expect(result).toEqual({ ...mockTokens, user: mockUser });
      expect(providerImpl.exchangeCodeForProfile).toHaveBeenCalledWith(
        CODE,
        REDIRECT_URI,
        CODE_VERIFIER,
      );
      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(oauthAccountRepository.findByProviderAccount).toHaveBeenCalledWith(
        'google',
        mockProfile.id,
        TX_SENTINEL,
      );
      expect(userService.findById).toHaveBeenCalledWith(
        mockOAuthAccount.userId,
        TX_SENTINEL,
      );
      expect(oauthAccountRepository.create).not.toHaveBeenCalled();
      expect(userService.createOAuthUser).not.toHaveBeenCalled();
      expect(authService.generateTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
      expect(userService.hashToken).toHaveBeenCalledWith(
        mockTokens.refreshToken,
      );
      expect(userService.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        'hashed-refresh',
        TX_SENTINEL,
      );
    });

    it('creates new user and oauth_accounts when nothing matches', async () => {
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(null);
      userService.findByEmail.mockResolvedValue(null);
      userService.createOAuthUser.mockResolvedValue(mockUser);

      await service.handleCallback('google', CODE, CODE_VERIFIER);

      expect(userService.createOAuthUser).toHaveBeenCalledWith(
        {
          name: mockProfile.name,
          email: mockProfile.email,
          avatar: mockProfile.avatar,
        },
        TX_SENTINEL,
      );
      expect(oauthAccountRepository.create).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          provider: 'google',
          providerAccountId: mockProfile.id,
          avatar: mockProfile.avatar,
        },
        TX_SENTINEL,
      );
    });

    it('auto-links oauth_accounts to existing user found by email', async () => {
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(null);
      userService.findByEmail.mockResolvedValue(mockUser);

      await service.handleCallback('google', CODE, CODE_VERIFIER);

      expect(userService.createOAuthUser).not.toHaveBeenCalled();
      expect(oauthAccountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          provider: 'google',
          providerAccountId: mockProfile.id,
        }),
        TX_SENTINEL,
      );
    });

    it('does not start a transaction when provider exchange fails', async () => {
      providerImpl.exchangeCodeForProfile.mockRejectedValue(
        new OAuthCodeExchangeException('boom'),
      );

      await expect(
        service.handleCallback('google', CODE, CODE_VERIFIER),
      ).rejects.toThrow(OAuthCodeExchangeException);

      expect(db.transaction).not.toHaveBeenCalled();
      expect(authService.generateTokens).not.toHaveBeenCalled();
    });

    it('propagates errors from oauthAccountRepository.create and skips token issuance', async () => {
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(null);
      userService.findByEmail.mockResolvedValue(null);
      userService.createOAuthUser.mockResolvedValue(mockUser);
      oauthAccountRepository.create.mockRejectedValue(
        new Error('insert failed'),
      );

      // Note: actual rollback semantics are exercised in stage 5 e2e tests.
      // Here we only verify the error propagates and JWT issuance is skipped.
      await expect(
        service.handleCallback('google', CODE, CODE_VERIFIER),
      ).rejects.toThrow('insert failed');
      expect(authService.generateTokens).not.toHaveBeenCalled();
    });

    it('rejects unverified email for new users (defense-in-depth)', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        emailVerified: false,
      });
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(null);

      await expect(
        service.handleCallback('google', CODE, CODE_VERIFIER),
      ).rejects.toThrow('OAuth provider email is not verified');
      expect(userService.createOAuthUser).not.toHaveBeenCalled();
      expect(oauthAccountRepository.create).not.toHaveBeenCalled();
    });

    it('allows login for existing oauth accounts even with unverified email', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        emailVerified: false,
      });
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(
        mockOAuthAccount,
      );
      userService.findById.mockResolvedValue(mockUser);

      const result = await service.handleCallback(
        'google',
        CODE,
        CODE_VERIFIER,
      );

      expect(result).toEqual({ ...mockTokens, user: mockUser });
      expect(userService.findById).toHaveBeenCalledWith(
        mockOAuthAccount.userId,
        TX_SENTINEL,
      );
      expect(authService.generateTokens).toHaveBeenCalled();
    });
  });

  describe('linkProvider', () => {
    const linkUser = {
      ...mockUser,
      id: 5,
      email: 'link-test@example.com',
    };

    it('links a new OAuth account when emails match', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        email: linkUser.email,
      });
      userService.findById.mockResolvedValue(linkUser);
      oauthAccountRepository.findByProviderAccount.mockResolvedValue(null);
      oauthAccountRepository.create.mockResolvedValue(mockOAuthAccount);

      const result = await service.linkProvider(
        linkUser.id,
        'google',
        CODE,
        CODE_VERIFIER,
      );

      expect(result).toEqual(linkUser);
      expect(providerImpl.exchangeCodeForProfile).toHaveBeenCalledWith(
        CODE,
        REDIRECT_URI,
        CODE_VERIFIER,
      );
      expect(userService.findById).toHaveBeenCalledWith(
        linkUser.id,
        TX_SENTINEL,
      );
      expect(oauthAccountRepository.findByProviderAccount).toHaveBeenCalledWith(
        'google',
        mockProfile.id,
        TX_SENTINEL,
      );
      expect(oauthAccountRepository.create).toHaveBeenCalledWith(
        {
          userId: linkUser.id,
          provider: 'google',
          providerAccountId: mockProfile.id,
          avatar: mockProfile.avatar,
        },
        TX_SENTINEL,
      );
    });

    it('throws OAuthLinkEmailMismatchException when profile email differs', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue(mockProfile);
      userService.findById.mockResolvedValue(linkUser);

      await expect(
        service.linkProvider(linkUser.id, 'google', CODE, CODE_VERIFIER),
      ).rejects.toThrow(OAuthLinkEmailMismatchException);

      expect(oauthAccountRepository.create).not.toHaveBeenCalled();
    });

    it('throws OAuthAccountAlreadyLinkedException when account belongs to another user', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        email: linkUser.email,
      });
      userService.findById.mockResolvedValue(linkUser);
      oauthAccountRepository.findByProviderAccount.mockResolvedValue({
        ...mockOAuthAccount,
        userId: 999,
      });

      await expect(
        service.linkProvider(linkUser.id, 'google', CODE, CODE_VERIFIER),
      ).rejects.toThrow(OAuthAccountAlreadyLinkedException);

      expect(oauthAccountRepository.create).not.toHaveBeenCalled();
    });

    it('is idempotent when the same provider account is already linked to the same user', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        email: linkUser.email,
      });
      userService.findById.mockResolvedValue(linkUser);
      oauthAccountRepository.findByProviderAccount.mockResolvedValue({
        ...mockOAuthAccount,
        userId: linkUser.id,
      });

      const result = await service.linkProvider(
        linkUser.id,
        'google',
        CODE,
        CODE_VERIFIER,
      );

      expect(result).toEqual(linkUser);
      expect(oauthAccountRepository.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user does not exist', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        email: linkUser.email,
      });
      userService.findById.mockResolvedValue(null);

      await expect(
        service.linkProvider(linkUser.id, 'google', CODE, CODE_VERIFIER),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws OAuthEmailNotVerifiedException when profile email is unverified', async () => {
      providerImpl.exchangeCodeForProfile.mockResolvedValue({
        ...mockProfile,
        emailVerified: false,
      });

      await expect(
        service.linkProvider(linkUser.id, 'google', CODE, CODE_VERIFIER),
      ).rejects.toThrow(OAuthEmailNotVerifiedException);
    });

    it('propagates OAuthEmailNotVerifiedException from the provider', async () => {
      providerImpl.exchangeCodeForProfile.mockRejectedValue(
        new OAuthEmailNotVerifiedException(),
      );

      await expect(
        service.linkProvider(linkUser.id, 'google', CODE, CODE_VERIFIER),
      ).rejects.toThrow(OAuthEmailNotVerifiedException);
    });
  });
});
