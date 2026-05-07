import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { hashSync } from 'bcrypt';

import { UserService } from '$src/user/user.service';
import type { User } from '$db/schemas';

import { TokenService } from './token.service';
import { AuthRegisterDto } from './dto';

// Dummy hash for constant-time comparison (generated at startup)
const DUMMY_REFRESH_HASH = hashSync('dummy-refresh-token', 10);

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Validates user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns User object if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    // OAuth-only пользователь без пароля
    if (user && !user.passwordHash) {
      this._logger.warn(
        `Login attempt for OAuth-only user: ${email.slice(0, 3)}***`,
      );
      return null;
    }

    if (
      user &&
      (await this.userService.validatePassword(password, user.passwordHash))
    ) {
      return user;
    }
    this._logger.warn(
      `Failed login attempt for email prefix: ${email.slice(0, 3)}***`,
    );
    return null;
  }

  /**
   * Registers a new user
   * @param dto - Registration data
   * @returns Access and refresh tokens
   */
  async register(
    dto: AuthRegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.create(dto);
    this._logger.log(`User registered: ${user.id}`);
    return this.tokenService.issueTokens(user);
  }

  /**
   * Authenticates user with email and password
   * @param email - User email
   * @param password - Plain text password
   * @returns Access and refresh tokens
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this._logger.log(`User logged in: ${user.id}`);
    return this.tokenService.issueTokens(user);
  }

  /**
   * Refreshes access token using refresh token
   * @param user - User from RefreshGuard
   * @param refreshToken - Refresh token from cookie
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if token is invalid
   */
  async refresh(user: User, refreshToken: string) {
    const storedHash = user.refreshTokenHash ?? DUMMY_REFRESH_HASH;

    // Constant-time: bcrypt.compare() всегда выполняется
    const isValid = await this.userService.validateRefreshToken(
      refreshToken,
      storedHash,
    );

    if (!isValid) {
      this._logger.warn(`Failed refresh token: userId=${user.id}`);
      // Dummy operation to align response time (timing attack prevention)
      await this.userService.hashToken('dummy');
      throw new UnauthorizedException();
    }

    this._logger.log(`Token refreshed: ${user.id}`);
    return this.tokenService.issueTokens(user);
  }

  /**
   * Logs out user by clearing refresh token hash
   * @param userId - User ID
   */
  async logout(userId: number) {
    await this.userService.updateRefreshTokenHash(userId, null);
    this._logger.log(`User logged out: ${userId}`);
  }
}
