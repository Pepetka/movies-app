import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';

import { UserRole } from '$common/enums';

import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  RefreshCookieOptions,
} from './auth.constants';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReply = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    code: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

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
          provide: REFRESH_COOKIE_OPTIONS,
          useValue: mockCookieOptions,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;

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
      expect(authService.refresh).toHaveBeenCalledWith(
        mockUser.id,
        refreshToken,
      );
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
});
