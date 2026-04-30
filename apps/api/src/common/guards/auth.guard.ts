import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import type { UserRequest } from '$src/auth/types/user-request.type';
import { JWT_ACCESS_AUDIENCE } from '$src/auth/auth.constants';
import { UserService } from '$src/user/user.service';
import { IS_PUBLIC_KEY } from '$common/decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly _logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const token = this._extractBearerToken(request);

    let payload: { sub: number };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: number }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        algorithms: ['HS256'],
        issuer: this.configService.getOrThrow<string>('JWT_ISSUER'),
        audience: JWT_ACCESS_AUDIENCE,
      });
    } catch (error) {
      this._logger.warn(
        `JWT verification failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;
    return true;
  }

  private _extractBearerToken(request: FastifyRequest): string {
    const auth = request.headers.authorization;
    if (!auth) {
      throw new UnauthorizedException();
    }
    const parts = auth.split(' ', 2);
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new UnauthorizedException();
    }
    return parts[1];
  }
}
