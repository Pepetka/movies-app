import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { UserRole } from '$common/enums';

import { UserCreateDto, UserUpdateDto } from './dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;

    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    const createUserDto: UserCreateDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should create user and return UserResponseDto', async () => {
      userService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const error = new ConflictException('Email already in use');
      userService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('GET /users', () => {
    const mockUsers = [mockUser];

    it('should return paginated list with default params', async () => {
      userService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
      });
    });

    it('should return paginated list with custom params', async () => {
      userService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(2, 10);

      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 10,
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      userService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      const error = new Error('User not found');
      userService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(999)).rejects.toThrow(error);
    });
  });

  describe('PATCH /users/:id', () => {
    const updateUserDto: UserUpdateDto = {
      name: 'Updated Name',
    };

    const updatedUser = { ...mockUser, name: 'Updated Name' };

    it('should update user', async () => {
      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should propagate NotFoundException', async () => {
      const error = new Error('User not found');
      userService.update.mockRejectedValue(error);

      await expect(controller.update(999, updateUserDto)).rejects.toThrow(
        error,
      );
    });

    it('should propagate ConflictException for duplicate email', async () => {
      const error = new ConflictException('Email already in use');
      userService.update.mockRejectedValue(error);

      await expect(
        controller.update(1, { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      userService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(userService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      const error = new Error('User not found');
      userService.remove.mockRejectedValue(error);

      await expect(controller.remove(999)).rejects.toThrow(error);
    });
  });
});
