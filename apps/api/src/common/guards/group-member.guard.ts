import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

import type { UserRequest } from '$src/auth/types/user-request.type';
import { GroupsService } from '$src/groups/groups.service';
import { GROUP_MEMBER_KEY } from '$common/decorators';

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isMemberRequired = this.reflector.getAllAndOverride<boolean>(
      GROUP_MEMBER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isMemberRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;
    const userId = user?.id;

    if (!userId) {
      throw new ForbiddenException('Access denied');
    }

    const params = request.params as { id?: string; groupId?: string };
    const groupId = params.groupId || params.id;

    if (!groupId) {
      throw new ForbiddenException('Group ID required');
    }

    const groupsService = this.moduleRef.get(GroupsService, { strict: false });

    const isMember = await groupsService.isMember(Number(groupId), userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return true;
  }
}
