import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcrypt';

import { UserService } from '$src/user/user.service';
import type { User } from '$db/schemas';

import { AuthRegisterDto } from './dto';

type ExpiresUnits = 'd' | 'h' | 'm' | 's';
export type Expires = `${number}${ExpiresUnits}`;

// Dummy hash for constant-time comparison (generated at startup)
const DUMMY_REFRESH_HASH = hashSync('dummy-refresh-token', 10);

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns User object if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
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
  async register(dto: AuthRegisterDto) {
    const user = await this.userService.create(dto);
    this._logger.log(`User registered: ${user.id}`);
    const tokens = await this._generateTokens(user.id, user.email, user.role);
    const tokenHash = await this.userService.hashToken(tokens.refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, tokenHash);
    return tokens;
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
    const tokens = await this._generateTokens(user.id, user.email, user.role);
    const tokenHash = await this.userService.hashToken(tokens.refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, tokenHash);

    return tokens;
  }

  /**
   * Refreshes access token using refresh token
   * @param userId - User ID from JWT
   * @param refreshToken - Refresh token from cookie
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if token is invalid
   */
  async refresh(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);
    const storedHash = user?.refreshTokenHash ?? DUMMY_REFRESH_HASH;

    // Constant-time: bcrypt.compare() всегда выполняется
    const isValid = await this.userService.validateRefreshToken(
      refreshToken,
      storedHash,
    );

    if (!user || !isValid) {
      this._logger.warn(`Failed refresh token: userId=${userId}`);
      // Dummy operation to align response time (timing attack prevention)
      await this.userService.hashToken('dummy');
      throw new UnauthorizedException();
    }

    this._logger.log(`Token refreshed: ${user.id}`);
    const tokens = await this._generateTokens(user.id, user.email, user.role);
    const tokenHash = await this.userService.hashToken(tokens.refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, tokenHash);

    return tokens;
  }

  /**
   * Logs out user by clearing refresh token hash
   * @param userId - User ID
   */
  async logout(userId: number) {
    await this.userService.updateRefreshTokenHash(userId, null);
    this._logger.log(`User logged out: ${userId}`);
  }

  /**
   * Generates JWT access and refresh tokens
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @returns Object with accessToken and refreshToken
   */
  private async _generateTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow<Expires>(
            'JWT_ACCESS_EXPIRATION',
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<Expires>(
            'JWT_REFRESH_EXPIRATION',
          ),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
