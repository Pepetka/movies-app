import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  JWT_REFRESH_AUDIENCE,
  REFRESH_COOKIE_NAME,
} from '$src/auth/auth.constants';
import type { UserRequest } from '$src/auth/types/user-request.type';
import { UserService } from '$src/user/user.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  private readonly _logger = new Logger(RefreshGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>();
    const token = request.cookies?.[REFRESH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: { sub: number };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: number }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
        issuer: this.configService.getOrThrow<string>('JWT_ISSUER'),
        audience: JWT_REFRESH_AUDIENCE,
      });
    } catch (error) {
      this._logger.warn(
        `JWT verification failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    request.user = user;
    return true;
  }
}
