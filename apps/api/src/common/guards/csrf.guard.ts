import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Reflector } from '@nestjs/core';

import { CSRF_PROTECTED_KEY } from '$common/decorators';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isCsrfProtected = this.reflector.getAllAndOverride<boolean>(
      CSRF_PROTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isCsrfProtected) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    return new Promise((resolve) => {
      request.server.csrfProtection(request, response, () => {
        resolve(true);
      });
    });
  }
}
