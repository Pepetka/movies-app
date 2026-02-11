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
import { GROUP_MODERATOR_KEY } from '$common/decorators';

@Injectable()
export class GroupModeratorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isModeratorRequired = this.reflector.getAllAndOverride<boolean>(
      GROUP_MODERATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isModeratorRequired) {
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
