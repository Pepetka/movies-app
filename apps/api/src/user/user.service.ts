import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { EmailAlreadyInUseException } from '../common/exceptions';
import { UserCreateDto, UserUpdateDto } from './dto';
import type { User, NewUser } from '../db/schemas';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly _logger = new Logger(UserService.name);
  private readonly _SALT_ROUNDS: number;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    this._SALT_ROUNDS = this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  /**
   * Creates a new user
   * @param dto - User creation data
   * @returns Created user object
   * @throws EmailAlreadyInUseException if email already exists
   */
  async create(dto: UserCreateDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new EmailAlreadyInUseException(dto.email);
    }

    const passwordHash = await this._hashPassword(dto.password);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    this._logger.log(`User created with id: ${user.id}`);
    return user;
  }

  /**
   * Finds all users with pagination
   * @param opts - Pagination options
   * @param opts.limit - Maximum number of users to return
   * @param opts.offset - Number of users to skip
   * @returns Array of users
   */
  async findAll(
    opts: { limit?: number; offset?: number } = {},
  ): Promise<User[]> {
    return this.userRepository.findAll(opts.limit, opts.offset);
  }

  /**
   * Finds user by ID
   * @param id - User ID
   * @returns User object
   * @throws NotFoundException if user not found
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Updates user data
   * @param id - User ID
   * @param dto - User update data
   * @returns Updated user object
   * @throws NotFoundException if user not found
   * @throws EmailAlreadyInUseException if email already exists
   */
  async update(id: number, dto: UserUpdateDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new EmailAlreadyInUseException(dto.email);
      }
    }

    const updateData: Partial<Record<string, unknown>> = { ...dto };
    if (dto.password) {
      updateData.passwordHash = await this._hashPassword(dto.password);
      delete updateData.password;
    }

    const updatedUser = await this.userRepository.update(
      id,
      updateData as Partial<NewUser>,
    );
    return updatedUser;
  }

  /**
   * Deletes user by ID
   * @param id - User ID
   * @throws NotFoundException if user not found
   */
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.delete(id);
    this._logger.log(`User deleted with id: ${id}`);
  }

  /**
   * Finds user by email
   * @param email - User email
   * @returns User object or null
   */
  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Finds user by ID
   * @param id - User ID
   * @returns User object or null
   */
  async findById(id: number) {
    return this.userRepository.findById(id);
  }

  /**
   * Validates plain text password against hashed password
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns true if password matches, false otherwise
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Updates user's refresh token hash
   * @param id - User ID
   * @param hash - Hashed refresh token or null to clear
   */
  async updateRefreshTokenHash(id: number, hash: string | null): Promise<void> {
    await this.userRepository.updateRefreshTokenHash(id, hash);
  }

  /**
   * Validates plain text refresh token against hashed token
   * @param plainToken - Plain text refresh token
   * @param hashedToken - Hashed token from database
   * @returns true if token matches, false otherwise
   */
  async validateRefreshToken(
    plainToken: string,
    hashedToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainToken, hashedToken);
  }

  /**
   * Hashes plain text token using bcrypt
   * @param token - Plain text token
   * @returns Hashed token
   */
  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, this._SALT_ROUNDS);
  }

  /**
   * Hashes plain text password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async _hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this._SALT_ROUNDS);
  }
}
