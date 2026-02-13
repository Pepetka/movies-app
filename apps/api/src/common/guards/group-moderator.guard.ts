import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import type { UserRequest } from '$src/auth/types/user-request.type';
import { GroupsService } from '$src/groups/groups.service';

@Injectable()
export class GroupModeratorGuard implements CanActivate {
  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const canModerate = await groupsService.canModerate(
      Number(groupId),
      userId,
    );

    if (!canModerate) {
      throw new ForbiddenException('Requires group admin or moderator role');
    }

    return true;
  }
}
