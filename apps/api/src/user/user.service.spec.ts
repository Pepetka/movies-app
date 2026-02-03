import { Test, TestingModule } from '@nestjs/testing';
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
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
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

    it('should update email with uniqueness check', async () => {
      const updateDto: UserUpdateDto = { email: 'new@example.com' };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        email: 'new@example.com',
      });

      const result = await service.update(1, updateDto);

      expect(result.email).toBe('new@example.com');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'new@example.com',
      );
    });

    it('should hash password when updating', async () => {
      const updateDto: UserUpdateDto = { password: 'NewPassword123!' };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUser);

      await service.update(1, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        passwordHash: mockHashedPassword,
      });
      expect(userRepository.update).not.toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: expect.any(String) }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw EmailAlreadyInUseException for duplicate email', async () => {
      const anotherUser = { ...mockUser, id: 2, email: 'another@example.com' };
      const updateDto: UserUpdateDto = { email: 'another@example.com' };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(anotherUser);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating own email to same value', async () => {
      const updateDto: UserUpdateDto = { email: 'test@example.com' };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUser);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(1, updateDto);
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
      expect(userRepository.findById).toHaveBeenCalledWith(1);
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
  });

  describe('updateRefreshTokenHash', () => {
    it('should call repository with hash', async () => {
      userRepository.updateRefreshTokenHash.mockResolvedValue(undefined);

      await service.updateRefreshTokenHash(1, 'hashed-token');

      expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        'hashed-token',
      );
    });

    it('should call repository with null to clear', async () => {
      userRepository.updateRefreshTokenHash.mockResolvedValue(undefined);

      await service.updateRefreshTokenHash(1, null);

      expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        null,
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
