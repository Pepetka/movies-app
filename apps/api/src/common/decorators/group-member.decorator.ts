import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import type { GroupMember as GroupMemberType } from '$db/schemas';

export const GroupMember = createParamDecorator(
  (data: keyof GroupMemberType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const member = request.groupMember as GroupMemberType | undefined;
    if (!member) {
      throw new InternalServerErrorException(
        'GroupMember decorator used without group guard',
      );
    }
    return data ? member[data] : member;
  },
);
