import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { UserRequest } from '$src/auth/types/user-request.type';
import { AUTHOR_KEY } from '$common/decorators';

import { UserRole } from '../enums/user-role.enum';

type AuthorOptions = {
  from: 'params' | 'body' | 'query';
  key: string;
};

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<AuthorOptions | null>(
      AUTHOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    const userId = user?.id;

    if (!userId) {
      throw new ForbiddenException('Access denied');
    }

    const source = request[options.from] as Record<string, unknown>;
    const targetId = source?.[options.key];

    if (!targetId) {
      throw new ForbiddenException('Access denied');
    }

    if (userId !== Number(targetId)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
