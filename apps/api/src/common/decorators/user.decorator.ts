import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { User as UserType } from '$db/schemas';

export const User = createParamDecorator(
  (data: keyof UserType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserType | undefined;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);
