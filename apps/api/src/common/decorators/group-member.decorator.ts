import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { GroupMember as GroupMemberType } from '$db/schemas';

export const GroupMember = createParamDecorator(
  (data: keyof GroupMemberType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const member = request.groupMember as GroupMemberType | undefined;
    if (!member) {
      return undefined;
    }
    return data ? member[data] : member;
  },
);
