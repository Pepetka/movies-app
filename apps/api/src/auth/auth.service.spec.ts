import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '$src/user/user.service';
import { UserRole } from '$common/enums';

import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2b$12$hashedPassword',
  role: UserRole.USER,
  refreshTokenHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

const createMockJwtService = () => ({
  signAsync: jest.fn<
    Promise<string>,
    [unknown, { secret?: string; expiresIn?: string } | undefined]
  >(),
});

const createMockConfigService = () => ({
  getOrThrow: jest.fn<unknown, [string]>(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let _jwtService: ReturnType<typeof createMockJwtService>;
  let _configService: ReturnType<typeof createMockConfigService>;

  beforeEach(async () => {
    const mockJwt = createMockJwtService();
    const mockConfig = createMockConfigService();

    mockConfig.getOrThrow.mockImplementation((key: string) => {
      const config: Record<string, unknown> = {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key] as string;
    });

    mockJwt.signAsync.mockImplementation(async (_payload, options) => {
      return options?.secret === 'test-refresh-secret'
        ? mockTokens.refreshToken
        : mockTokens.accessToken;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            validatePassword: jest.fn(),
            findById: jest.fn(),
            updateRefreshTokenHash: jest.fn(),
            hashToken: jest.fn(),
            validateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    _jwtService = mockJwt;
    _configService = mockConfig;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userService.validatePassword).toHaveBeenCalledWith(
        'password123',
        mockUser.passwordHash,
      );
    });

    it('should return null if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    const registerDto: AuthRegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should return tokens on successful registration', async () => {
      userService.create.mockResolvedValue(mockUser);
      userService.hashToken.mockResolvedValue('hashed-refresh-token');

      const result = await service.register(registerDto);

      expect(result).toEqual(mockTokens);
      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(userService.hashToken).toHaveBeenCalledWith(
        mockTokens.refreshToken,
      );
      expect(userService.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        'hashed-refresh-token',
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);
      userService.hashToken.mockResolvedValue('hashed-refresh-token');

      const result = await service.login('test@example.com', 'password123');

      expect(result).toEqual(mockTokens);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        'password123',
        mockUser.passwordHash,
      );
      expect(userService.hashToken).toHaveBeenCalledWith(
        mockTokens.refreshToken,
      );
      expect(userService.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        'hashed-refresh-token',
      );
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('notfound@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const hashedToken = 'hashed-refresh-token';

      userService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: hashedToken,
      });
      userService.validateRefreshToken.mockResolvedValue(true);
      userService.hashToken.mockResolvedValue('new-hashed-token');

      const result = await service.refresh(mockUser.id, refreshToken);

      expect(result).toEqual(mockTokens);
      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userService.validateRefreshToken).toHaveBeenCalledWith(
        refreshToken,
        hashedToken,
      );
      expect(userService.hashToken).toHaveBeenCalledWith(
        mockTokens.refreshToken,
      );
      expect(userService.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        'new-hashed-token',
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      const hashedToken = 'hashed-refresh-token';

      userService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: hashedToken,
      });
      userService.validateRefreshToken.mockResolvedValue(false);
      userService.hashToken.mockResolvedValue('dummy-hash');

      await expect(service.refresh(mockUser.id, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.hashToken).toHaveBeenCalledWith('dummy');
    });

    it('should throw UnauthorizedException when user not found with timing dummy op', async () => {
      const refreshToken = 'some-refresh-token';

      userService.findById.mockResolvedValue(null);
      userService.validateRefreshToken.mockResolvedValue(false);
      userService.hashToken.mockResolvedValue('dummy-hash');

      await expect(service.refresh(999, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.hashToken).toHaveBeenCalledWith('dummy');
    });

    it('should throw UnauthorizedException when refresh token hash is null', async () => {
      const refreshToken = 'some-refresh-token';

      userService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });
      userService.validateRefreshToken.mockResolvedValue(false);
      userService.hashToken.mockResolvedValue('dummy-hash');

      await expect(service.refresh(mockUser.id, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.hashToken).toHaveBeenCalledWith('dummy');
    });
  });

  describe('logout', () => {
    it('should clear refresh token hash', async () => {
      await service.logout(mockUser.id);

      expect(userService.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
    });
  });
});
