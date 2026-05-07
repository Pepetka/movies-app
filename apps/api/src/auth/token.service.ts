import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { DrizzleTx } from '$db/types/drizzle.types';
import { UserService } from '$src/user/user.service';
import type { User } from '$db/schemas';

import { JWT_REFRESH_AUDIENCE } from './auth.constants';
import type { Expires } from './types/expires.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * Generates access/refresh tokens, hashes the refresh token,
   * and persists the hash atomically (optionally inside a transaction).
   */
  async issueTokens(
    user: User,
    tx?: DrizzleTx,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this._generateTokens(user.id, user.email, user.role);
    const tokenHash = await this.userService.hashToken(tokens.refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, tokenHash, tx);
    return tokens;
  }

  private async _generateTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email, role }),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<Expires>(
            'JWT_REFRESH_EXPIRATION',
          ),
          issuer: this.configService.getOrThrow<string>('JWT_ISSUER'),
          audience: JWT_REFRESH_AUDIENCE,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
