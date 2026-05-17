import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { EmailAlreadyInUseException } from '../common/exceptions';
import type { DrizzleTx } from '../db/types/drizzle.types';
import { UserCreateDto, UserUpdateDto } from './dto';
import { isUniqueViolation } from '../common/utils';
import type { User, NewUser } from '../db/schemas';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly _logger = new Logger(UserService.name);
  private readonly _SALT_ROUNDS: number;

  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _configService: ConfigService,
  ) {
    this._SALT_ROUNDS = this._configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  /**
   * Creates a new user
   * @param dto - User creation data
   * @returns Created user object
   * @throws EmailAlreadyInUseException if email already exists
   */
  async create(dto: UserCreateDto): Promise<User> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser =
      await this._userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new EmailAlreadyInUseException(normalizedEmail);
    }

    const passwordHash = await this._hashPassword(dto.password);

    try {
      const user = await this._userRepository.create({
        name: dto.name,
        email: normalizedEmail,
        passwordHash,
      });

      this._logger.log(`User created with id: ${user.id}`);
      return user;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new EmailAlreadyInUseException(normalizedEmail);
      }
      throw error;
    }
  }

  /**
   * Creates a user without password (OAuth-only).
   * Creates only the `users` row — oauth_accounts linkage happens in OAuthService.
   */
  async createOAuthUser(
    data: { name: string; email: string; avatar?: string | null },
    tx?: DrizzleTx,
  ): Promise<User> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existingUser = await this._userRepository.findByEmail(
      normalizedEmail,
      tx,
    );
    if (existingUser) {
      throw new EmailAlreadyInUseException(normalizedEmail);
    }

    try {
      const user = await this._userRepository.create(
        {
          name: data.name,
          email: normalizedEmail,
          passwordHash: null,
          avatar: data.avatar ?? null,
        },
        tx,
      );

      this._logger.log(`OAuth user created with id: ${user.id}`);
      return user;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new EmailAlreadyInUseException(normalizedEmail);
      }
      throw error;
    }
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
    return this._userRepository.findAll(opts.limit, opts.offset);
  }

  /**
   * Finds user by ID
   * @param id - User ID
   * @returns User object
   * @throws NotFoundException if user not found
   */
  async findOne(id: number): Promise<User> {
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Updates user profile data (name and avatar only)
   * @param id - User ID
   * @param dto - User update data
   * @returns Updated user object
   * @throws NotFoundException if user not found
   */
  async update(id: number, dto: UserUpdateDto): Promise<User> {
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updateData: Partial<NewUser> = {};
    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.avatar !== undefined) {
      updateData.avatar = dto.avatar;
    }

    const updatedUser = await this._userRepository.update(id, updateData);
    return updatedUser;
  }

  /**
   * Deletes user by ID
   * @param id - User ID
   * @throws NotFoundException if user not found
   */
  async remove(id: number): Promise<void> {
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this._userRepository.delete(id);
    this._logger.log(`User deleted with id: ${id}`);
  }

  /**
   * Finds user by email
   * @param email - User email
   * @returns User object or null
   */
  async findByEmail(email: string, tx?: DrizzleTx) {
    return this._userRepository.findByEmail(email, tx);
  }

  /**
   * Finds user by ID
   * @param id - User ID
   * @returns User object or null
   */
  async findById(id: number, tx?: DrizzleTx) {
    return this._userRepository.findById(id, tx);
  }

  /**
   * Updates user's avatar
   * @param id - User ID
   * @param avatar - Avatar URL or null
   * @param tx - Optional transaction
   */
  /**
   * Updates user's avatar. Intended for OAuth account linkage only.
   * For general profile updates use `update()` instead.
   */
  async updateAvatar(
    id: number,
    avatar: string | null,
    tx?: DrizzleTx,
  ): Promise<User> {
    return this._userRepository.update(id, { avatar }, tx);
  }

  /**
   * Validates plain text password against hashed password
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns true if password matches, false otherwise
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string | null,
  ): Promise<boolean> {
    if (!hashedPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Updates user's refresh token hash
   * @param id - User ID
   * @param hash - Hashed refresh token or null to clear
   */
  async updateRefreshTokenHash(
    id: number,
    hash: string | null,
    tx?: DrizzleTx,
  ): Promise<void> {
    await this._userRepository.updateRefreshTokenHash(id, hash, tx);
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
