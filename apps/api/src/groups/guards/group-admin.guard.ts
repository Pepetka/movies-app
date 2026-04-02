import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { GroupsRepository } from '$src/groups/groups.repository';
import { GroupMemberRole } from '$common/enums';

import { BaseGroupGuard } from './base-group.guard';

@Injectable()
export class GroupAdminGuard extends BaseGroupGuard {
  constructor(groupsRepository: GroupsRepository) {
    super(groupsRepository);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const member = await this.getMember(context);

    if (member.role !== GroupMemberRole.ADMIN) {
      throw new ForbiddenException('Requires group admin role');
    }

    return true;
  }
}
