import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { REFRESH_COOKIE_NAME } from '$src/auth/auth.constants';
import { UserService } from '$src/user/user.service';
import { UserRole } from '$common/enums';

import { RefreshGuard } from './refresh.guard';

describe('RefreshGuard', () => {
  let guard: RefreshGuard;
  let jwtService: jest.Mocked<JwtService>;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    passwordHash: '$2b$12$hashedPassword',
    refreshTokenHash: 'hashed-refresh-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockExecutionContext = (cookie?: string): ExecutionContext => {
    const request = {
      cookies: cookie ? { [REFRESH_COOKIE_NAME]: cookie } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                JWT_ISSUER: 'movies-app-test',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
              };
              return config[key] as string;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<RefreshGuard>(RefreshGuard);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    userService = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('valid refresh cookie', () => {
    it('should allow access and set request.user', async () => {
      const context = createMockExecutionContext('valid-refresh-token');
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      userService.findById.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
        {
          secret: 'test-refresh-secret',
          algorithms: ['HS256'],
          issuer: 'movies-app-test',
          audience: 'movies-app-refresh',
        },
      );
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(context.switchToHttp().getRequest().user).toEqual(mockUser);
    });
  });

  describe('missing cookie', () => {
    it('should throw UnauthorizedException', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('invalid JWT', () => {
    it('should throw UnauthorizedException when jwt verification fails', async () => {
      const context = createMockExecutionContext('invalid-token');
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('user not found', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      const context = createMockExecutionContext('valid-token');
      jwtService.verifyAsync.mockResolvedValue({ sub: 999 });
      userService.findById.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('user without refresh token hash', () => {
    it('should throw UnauthorizedException', async () => {
      const context = createMockExecutionContext('valid-token');
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      userService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
