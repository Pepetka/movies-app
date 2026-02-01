import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { UserRequest } from '$src/auth/types/user-request.type';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    return request.user;
  },
);
