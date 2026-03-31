import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import type { UserRequest } from '$src/auth/types/user-request.type';
import { GroupsRepository } from '$src/groups/groups.repository';
import type { GroupMember } from '$db/schemas';

export abstract class BaseGroupGuard implements CanActivate {
  constructor(protected readonly groupsRepository: GroupsRepository) {}

  protected async getMember(context: ExecutionContext): Promise<GroupMember> {
    const request = context.switchToHttp().getRequest<UserRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Access denied');
    }

    const params = request.params as { id?: string; groupId?: string };
    const groupId = params.groupId || params.id;

    if (!groupId) {
      throw new ForbiddenException('Group ID required');
    }

    const parsedId = Number(groupId);
    if (!Number.isFinite(parsedId)) {
      throw new ForbiddenException('Invalid Group ID');
    }

    const member = await this.groupsRepository.findMember(parsedId, userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    request.groupMember = member;
    return member;
  }

  abstract canActivate(context: ExecutionContext): Promise<boolean>;
}
