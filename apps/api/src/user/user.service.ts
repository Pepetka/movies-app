import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import type { User, NewUser } from '../db/schemas';
import { EmailAlreadyInUseException } from '../common/exceptions';
import { UserCreateDto, UserUpdateDto } from './dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly _logger = new Logger(UserService.name);
  private readonly _SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {}

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

  async findAll(opts: { limit?: number; offset?: number } = {}): Promise<User[]> {
    return this.userRepository.findAll(opts.limit, opts.offset);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

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

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.delete(id);
    this._logger.log(`User deleted with id: ${id}`);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async _hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this._SALT_ROUNDS);
  }
}
