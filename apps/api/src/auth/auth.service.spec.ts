import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from '$src/user/user.service';
import { UserRole } from '$common/enums';

import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2b$12$hashedPassword',
  role: UserRole.USER,
  refreshTokenHash: null,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
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
          provide: TokenService,
          useValue: {
            issueTokens: jest.fn().mockResolvedValue(mockTokens),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    tokenService = module.get<TokenService>(
      TokenService,
    ) as jest.Mocked<TokenService>;
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

    it('should return null for OAuth-only user (passwordHash is null)', async () => {
      userService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: null,
      });

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(userService.validatePassword).not.toHaveBeenCalled();
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

      const result = await service.register(registerDto);

      expect(result).toEqual(mockTokens);
      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(tokenService.issueTokens).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      const result = await service.login('test@example.com', 'password123');

      expect(result).toEqual(mockTokens);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        'password123',
        mockUser.passwordHash,
      );
      expect(tokenService.issueTokens).toHaveBeenCalledWith(mockUser);
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

      userService.validateRefreshToken.mockResolvedValue(true);

      const result = await service.refresh(
        { ...mockUser, refreshTokenHash: hashedToken },
        refreshToken,
      );

      expect(result).toEqual(mockTokens);
      expect(userService.validateRefreshToken).toHaveBeenCalledWith(
        refreshToken,
        hashedToken,
      );
      expect(tokenService.issueTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          refreshTokenHash: hashedToken,
        }),
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      const hashedToken = 'hashed-refresh-token';

      userService.validateRefreshToken.mockResolvedValue(false);
      userService.hashToken.mockResolvedValue('dummy-hash');

      await expect(
        service.refresh(
          { ...mockUser, refreshTokenHash: hashedToken },
          refreshToken,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.hashToken).toHaveBeenCalledWith('dummy');
    });

    it('should throw UnauthorizedException when refresh token hash is null', async () => {
      const refreshToken = 'some-refresh-token';

      userService.validateRefreshToken.mockResolvedValue(false);
      userService.hashToken.mockResolvedValue('dummy-hash');

      await expect(
        service.refresh({ ...mockUser, refreshTokenHash: null }, refreshToken),
      ).rejects.toThrow(UnauthorizedException);
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
