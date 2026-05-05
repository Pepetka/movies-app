import { UnauthorizedException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '$common/enums';

import {
  OAuthAccountAlreadyLinkedException,
  OAuthCodeExchangeException,
  OAuthEmailNotVerifiedException,
  OAuthLinkEmailMismatchException,
} from './oauth/exceptions';
import {
  OAUTH_SESSION_COOKIE_NAME,
  OAUTH_SESSION_COOKIE_PATH,
  OAUTH_ERROR_PATH,
  OAUTH_LINK_SUCCESS_PATH,
} from './oauth/oauth.constants';
import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  RefreshCookieOptions,
} from './auth.constants';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { RefreshGuard } from './guards/refresh.guard';
import { OAuthService } from './oauth/oauth.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let oauthService: jest.Mocked<OAuthService>;

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockCookieOptions: RefreshCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
    maxAge: 604800000,
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    passwordHash: '$2b$12$hashedPassword',
    refreshTokenHash: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReply = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
    code: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  const mockOAuthService = {
    buildAuthUrl: jest.fn(),
    handleCallback: jest.fn(),
    linkProvider: jest.fn(),
    mapErrorToReason: jest.fn().mockImplementation((e: Error) => {
      if (e.constructor.name === 'OAuthEmailNotVerifiedException')
        return 'oauth_email_unverified';
      if (e.constructor.name === 'OAuthCodeExchangeException')
        return 'oauth_code_exchange_failed';
      if (e.constructor.name === 'OAuthProviderNotConfiguredException')
        return 'oauth_provider_not_configured';
      if (e.constructor.name === 'UnsupportedOAuthProviderException')
        return 'oauth_unsupported_provider';
      if (e.constructor.name === 'OAuthLinkEmailMismatchException')
        return 'oauth_link_email_mismatch';
      if (e.constructor.name === 'OAuthAccountAlreadyLinkedException')
        return 'oauth_account_already_linked';
      return 'oauth_failed';
    }),
    buildErrorUrl: jest
      .fn()
      .mockImplementation(
        (reason: string) =>
          `http://localhost:5173/oauth/error?reason=${reason}`,
      ),
    getPrimaryWebUrl: jest.fn().mockReturnValue('http://localhost:5173'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          }),
        },
        {
          provide: OAuthService,
          useValue: mockOAuthService,
        },
        {
          provide: REFRESH_COOKIE_OPTIONS,
          useValue: mockCookieOptions,
        },
      ],
    })
      .overrideGuard(RefreshGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
    oauthService = module.get<OAuthService>(
      OAuthService,
    ) as jest.Mocked<OAuthService>;

    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    const registerDto: AuthRegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should return access token and set refresh cookie on successful registration', async () => {
      authService.register.mockResolvedValue(mockTokens);

      const result = await controller.register(registerDto, mockReply);

      expect(result).toEqual({ accessToken: mockTokens.accessToken });
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(mockReply.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        mockTokens.refreshToken,
        mockCookieOptions,
      );
    });
  });

  describe('POST /login', () => {
    const loginDto: AuthLoginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should return access token and set refresh cookie on successful login', async () => {
      authService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(loginDto, mockReply);

      expect(result).toEqual({ accessToken: mockTokens.accessToken });
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockReply.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        mockTokens.refreshToken,
        mockCookieOptions,
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto, mockReply)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockReply.cookie).not.toHaveBeenCalled();
    });
  });

  describe('POST /logout', () => {
    it('should clear refresh cookie and logout user', async () => {
      await controller.logout(mockUser, mockReply);

      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
      expect(mockReply.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, {
        path: mockCookieOptions.path,
      });
    });
  });

  describe('POST /refresh', () => {
    const refreshToken = 'valid-refresh-token';

    it('should return new access token and set new refresh cookie', async () => {
      authService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh(
        mockUser,
        refreshToken,
        mockReply,
      );

      expect(result).toEqual({ accessToken: mockTokens.accessToken });
      expect(authService.refresh).toHaveBeenCalledWith(mockUser, refreshToken);
      expect(mockReply.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        mockTokens.refreshToken,
        mockCookieOptions,
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      authService.refresh.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.refresh(mockUser, refreshToken, mockReply),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockReply.cookie).not.toHaveBeenCalled();
    });
  });

  describe('GET /oauth/:provider', () => {
    it('should set signed oauth_session cookie and redirect to provider URL', async () => {
      mockOAuthService.buildAuthUrl.mockReturnValue(
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=test',
      );

      await controller.oauthRedirect('google', undefined, mockReply);

      expect(mockReply.cookie).toHaveBeenCalledWith(
        OAUTH_SESSION_COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          signed: true,
          sameSite: 'lax',
          path: OAUTH_SESSION_COOKIE_PATH,
          maxAge: 600000,
        }),
      );
      expect(mockOAuthService.buildAuthUrl).toHaveBeenCalledWith(
        'google',
        expect.any(String),
        expect.any(String),
      );
      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining('accounts.google.com'),
        302,
      );
    });

    it('should store redirect in oauth_session cookie when provided', async () => {
      mockOAuthService.buildAuthUrl.mockReturnValue(
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=test',
      );

      await controller.oauthRedirect('google', '/invite/test-token', mockReply);

      const cookieValue = JSON.parse(
        (
          (mockReply.cookie as jest.Mock).mock.calls.find(
            (call: [string, string]) => call[0] === OAUTH_SESSION_COOKIE_NAME,
          ) as [string, string]
        )[1],
      );
      expect(cookieValue.redirect).toBe('/invite/test-token');
    });
  });

  describe('POST /oauth/:provider/link/init', () => {
    it('should require auth and return authUrl with intent=link session', async () => {
      mockOAuthService.buildAuthUrl.mockReturnValue(
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=test',
      );

      const result = await controller.oauthLinkInit(
        'google',
        mockUser,
        mockReply,
      );

      expect(result).toEqual({
        authUrl: expect.stringContaining('accounts.google.com'),
      });
      expect(mockReply.cookie).toHaveBeenCalledWith(
        OAUTH_SESSION_COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          signed: true,
          sameSite: 'lax',
          path: OAUTH_SESSION_COOKIE_PATH,
          maxAge: 600000,
        }),
      );

      const cookieValue = JSON.parse(
        (
          (mockReply.cookie as jest.Mock).mock.calls.find(
            (call: [string, string]) => call[0] === OAUTH_SESSION_COOKIE_NAME,
          ) as [string, string]
        )[1],
      );
      expect(cookieValue.intent).toBe('link');
      expect(cookieValue.userId).toBe(mockUser.id);
    });
  });

  describe('GET /oauth/:provider/callback', () => {
    const validSession = {
      state: 'test-state-123',
      codeVerifier: 'test-verifier-456',
      intent: 'login' as const,
    };

    const mockRequest = (opts?: {
      valid?: boolean;
      value?: string;
    }): FastifyRequest =>
      ({
        cookies: {
          [OAUTH_SESSION_COOKIE_NAME]: 'signed-cookie-value',
        },
        unsignCookie: jest.fn().mockReturnValue({
          valid: opts?.valid ?? true,
          value: opts?.value ?? JSON.stringify(validSession),
        }),
      }) as unknown as FastifyRequest;

    it('should redirect to /oauth/success on success and set refresh cookie', async () => {
      const request = mockRequest();
      oauthService.handleCallback.mockResolvedValue({
        ...mockTokens,
        user: mockUser,
      });

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code-789' },
        request,
        mockReply,
      );

      expect(oauthService.handleCallback).toHaveBeenCalledWith(
        'google',
        'auth-code-789',
        validSession.codeVerifier,
      );
      expect(mockReply.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        mockTokens.refreshToken,
        mockCookieOptions,
      );
      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/oauth/success'),
        302,
      );
    });

    it('should append redirect query param to /oauth/success when session has redirect', async () => {
      const request = mockRequest({
        value: JSON.stringify({
          ...validSession,
          redirect: '/invite/test-token',
        }),
      });
      oauthService.handleCallback.mockResolvedValue({
        ...mockTokens,
        user: mockUser,
      });

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code-789' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          '/oauth/success?redirect=%2Finvite%2Ftest-token',
        ),
        302,
      );
    });

    it('should redirect to /oauth/error on access_denied', async () => {
      const request = mockRequest();

      await controller.oauthCallback(
        'google',
        {
          state: validSession.state,
          error: 'access_denied',
        },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`${OAUTH_ERROR_PATH}?reason=access_denied`),
        302,
      );
    });

    it('should redirect to /oauth/error on invalid state', async () => {
      const request = mockRequest();

      await controller.oauthCallback(
        'google',
        { state: 'wrong-state', code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`${OAUTH_ERROR_PATH}?reason=invalid_state`),
        302,
      );
    });

    it('should redirect to /oauth/error on missing code', async () => {
      const request = mockRequest();

      await controller.oauthCallback(
        'google',
        { state: validSession.state },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`${OAUTH_ERROR_PATH}?reason=missing_code`),
        302,
      );
    });

    it('should redirect to /oauth/error on tampered cookie', async () => {
      const request = mockRequest({ valid: false, value: '' });

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`${OAUTH_ERROR_PATH}?reason=invalid_session`),
        302,
      );
    });

    it('should redirect to /oauth/error on email_unverified', async () => {
      const request = mockRequest();
      oauthService.handleCallback.mockRejectedValue(
        new OAuthEmailNotVerifiedException(),
      );

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          `${OAUTH_ERROR_PATH}?reason=oauth_email_unverified`,
        ),
        302,
      );
    });

    it('should redirect to /oauth/error on code exchange failure', async () => {
      const request = mockRequest();
      oauthService.handleCallback.mockRejectedValue(
        new OAuthCodeExchangeException('token error'),
      );

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          `${OAUTH_ERROR_PATH}?reason=oauth_code_exchange_failed`,
        ),
        302,
      );
    });

    it('should redirect to /oauth/link-success on successful link', async () => {
      const request = mockRequest({
        value: JSON.stringify({
          ...validSession,
          intent: 'link',
          userId: mockUser.id,
        }),
      });
      oauthService.linkProvider.mockResolvedValue(mockUser);

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(oauthService.linkProvider).toHaveBeenCalledWith(
        mockUser.id,
        'google',
        'auth-code',
        validSession.codeVerifier,
      );
      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(OAUTH_LINK_SUCCESS_PATH),
        302,
      );
    });

    it('should redirect to /oauth/error when link session lacks userId', async () => {
      const request = mockRequest({
        value: JSON.stringify({
          ...validSession,
          intent: 'link',
        }),
      });

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`${OAUTH_ERROR_PATH}?reason=invalid_session`),
        302,
      );
    });

    it('should redirect to /oauth/error on email mismatch during link', async () => {
      const request = mockRequest({
        value: JSON.stringify({
          ...validSession,
          intent: 'link',
          userId: mockUser.id,
        }),
      });
      oauthService.linkProvider.mockRejectedValue(
        new OAuthLinkEmailMismatchException(),
      );

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          `${OAUTH_ERROR_PATH}?reason=oauth_link_email_mismatch`,
        ),
        302,
      );
    });

    it('should redirect to /oauth/error when account already linked to another user', async () => {
      const request = mockRequest({
        value: JSON.stringify({
          ...validSession,
          intent: 'link',
          userId: mockUser.id,
        }),
      });
      oauthService.linkProvider.mockRejectedValue(
        new OAuthAccountAlreadyLinkedException(),
      );

      await controller.oauthCallback(
        'google',
        { state: validSession.state, code: 'auth-code' },
        request,
        mockReply,
      );

      expect(mockReply.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          `${OAUTH_ERROR_PATH}?reason=oauth_account_already_linked`,
        ),
        302,
      );
    });
  });
});
