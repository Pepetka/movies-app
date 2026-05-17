import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { EmailAlreadyInUseException } from '$common/exceptions';
import { UserRole } from '$common/enums';

import { UserCreateDto, UserUpdateDto } from './dto';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockHashedPassword = '$2b$12$mockHashedPassword';
const mockHashedToken = '$2b$12$mockHashedToken';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.USER,
  passwordHash: mockHashedPassword,
  refreshTokenHash: null,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockUserRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  emailExists: jest.fn(),
  updateRefreshTokenHash: jest.fn(),
});

const createMockConfigService = () => ({
  get: jest.fn().mockReturnValue(12),
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(async () => {
    const mockRepo = createMockUserRepository();
    const mockConfig = createMockConfigService();

    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = mockRepo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: UserCreateDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should create user with hashed password', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email.toLowerCase(),
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email.toLowerCase(),
        passwordHash: mockHashedPassword,
      });
    });

    it('should throw EmailAlreadyInUseException for duplicate email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw EmailAlreadyInUseException on unique constraint violation (race condition)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const dbError = new Error('Unique violation') as Error & { code: string };
      dbError.code = '23505';
      userRepository.create.mockRejectedValue(dbError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
    });
  });

  describe('createOAuthUser', () => {
    const oauthUserData = {
      name: 'OAuth User',
      email: 'oauth@example.com',
      avatar: 'https://example.com/avatar.png',
    };

    it('should create OAuth-only user with passwordHash: null', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const oauthUser = {
        ...mockUser,
        passwordHash: null,
        avatar: oauthUserData.avatar,
      };
      userRepository.create.mockResolvedValue(oauthUser);

      const result = await service.createOAuthUser(oauthUserData);

      expect(result).toEqual(oauthUser);
      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: oauthUserData.name,
          email: oauthUserData.email.toLowerCase(),
          passwordHash: null,
          avatar: oauthUserData.avatar,
        },
        undefined,
      );
    });

    it('should normalize email to lowercase and trim', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const oauthUser = {
        ...mockUser,
        email: 'normalized@example.com',
        passwordHash: null,
      };
      userRepository.create.mockResolvedValue(oauthUser);

      await service.createOAuthUser({
        name: 'OAuth User',
        email: '  Normalized@Example.COM  ',
        avatar: null,
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'normalized@example.com',
        undefined,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: 'OAuth User',
          email: 'normalized@example.com',
          passwordHash: null,
          avatar: null,
        },
        undefined,
      );
    });

    it('should throw EmailAlreadyInUseException for duplicate email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.createOAuthUser(oauthUserData)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw EmailAlreadyInUseException on unique constraint violation (race condition)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const dbError = new Error('Unique violation') as Error & { code: string };
      dbError.code = '23505';
      userRepository.create.mockRejectedValue(dbError);

      await expect(service.createOAuthUser(oauthUserData)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
    });
  });

  describe('findAll', () => {
    const mockUsers = [mockUser];

    it('should return paginated list', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual(mockUsers);
      expect(userRepository.findAll).toHaveBeenCalledWith(10, 0);
    });

    it('should handle empty result set', async () => {
      userRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual([]);
    });

    it('should use default values when opts not provided', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);

      await service.findAll();

      expect(userRepository.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto: UserUpdateDto = {
      name: 'Updated Name',
    };

    it('should update user name', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const result = await service.update(1, updateUserDto);

      expect(result.name).toBe('Updated Name');
      expect(userRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should update user avatar', async () => {
      const updateDto: UserUpdateDto = {
        avatar: 'https://example.com/avatar.jpg',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        avatar: 'https://example.com/avatar.jpg',
      });

      const result = await service.update(1, updateDto);

      expect(result.avatar).toBe('https://example.com/avatar.jpg');
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        avatar: 'https://example.com/avatar.jpg',
      });
    });

    it('should clear avatar when empty string provided', async () => {
      const updateDto = plainToInstance(UserUpdateDto, { avatar: '' });

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        avatar: null,
      });

      const result = await service.update(1, updateDto);

      expect(result.avatar).toBeNull();
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        avatar: null,
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
        undefined,
      );
    });

    it('should return null when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1, undefined);
    });

    it('should return null when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        'password123',
        'hashedPassword',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(
        'wrongpassword',
        'hashedPassword',
      );

      expect(result).toBe(false);
    });

    it('should return false when hashedPassword is null', async () => {
      const result = await service.validatePassword('password123', null);

      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('updateRefreshTokenHash', () => {
    it('should call repository with hash', async () => {
      userRepository.updateRefreshTokenHash.mockResolvedValue(undefined);

      await service.updateRefreshTokenHash(1, 'hashed-token');

      expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        'hashed-token',
        undefined,
      );
    });

    it('should call repository with null to clear', async () => {
      userRepository.updateRefreshTokenHash.mockResolvedValue(undefined);

      await service.updateRefreshTokenHash(1, null);

      expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        null,
        undefined,
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true for valid token', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateRefreshToken(
        'refresh-token',
        'hashedToken',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'refresh-token',
        'hashedToken',
      );
    });

    it('should return false for invalid token', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateRefreshToken(
        'wrong-token',
        'hashedToken',
      );

      expect(result).toBe(false);
    });
  });

  describe('hashToken', () => {
    it('should hash token with bcrypt', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedToken);

      const result = await service.hashToken('refresh-token');

      expect(result).toBe(mockHashedToken);
      expect(bcrypt.hash).toHaveBeenCalledWith('refresh-token', 12);
    });
  });
});
