import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '$src/user/user.service';
import { UserRole } from '$common/enums';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let userService: jest.Mocked<UserService>;
  let reflector: { getAllAndOverride: jest.Mock };

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

  const createMockExecutionContext = (
    _isPublic = false,
    authHeader?: string,
  ): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    } as FastifyRequest;

    const handler = () => {};
    const classRef = class {};

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => handler,
      getClass: () => classRef,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
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
                JWT_ACCESS_SECRET: 'test-secret',
              };
              return config[key] as string;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    userService = module.get(UserService) as jest.Mocked<UserService>;
    reflector = module.get(Reflector) as { getAllAndOverride: jest.Mock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('@Public() route', () => {
    it('should allow access without token', async () => {
      const context = createMockExecutionContext();
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });

  describe('valid Bearer token', () => {
    it('should allow access and set request.user', async () => {
      const context = createMockExecutionContext(false, 'Bearer valid-token');
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      userService.findById.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
        algorithms: ['HS256'],
        issuer: 'movies-app-test',
        audience: 'movies-app-access',
      });
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(context.switchToHttp().getRequest().user).toEqual(mockUser);
    });
  });

  describe('missing Authorization header', () => {
    it('should throw UnauthorizedException', async () => {
      const context = createMockExecutionContext(false);
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('invalid token format', () => {
    it('should throw UnauthorizedException for non-Bearer token', async () => {
      const context = createMockExecutionContext(false, 'Basic abc123');
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for empty token', async () => {
      const context = createMockExecutionContext(false, 'Bearer ');
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('invalid JWT', () => {
    it('should throw UnauthorizedException when jwt verification fails', async () => {
      const context = createMockExecutionContext(false, 'Bearer invalid-token');
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('user not found', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      const context = createMockExecutionContext(false, 'Bearer valid-token');
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verifyAsync.mockResolvedValue({ sub: 999 });
      userService.findById.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
