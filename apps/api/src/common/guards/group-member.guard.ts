import { ExecutionContext, Injectable } from '@nestjs/common';

import { GroupsRepository } from '$src/groups/groups.repository';

import { BaseGroupGuard } from './base-group.guard';

@Injectable()
export class GroupMemberGuard extends BaseGroupGuard {
  constructor(groupsRepository: GroupsRepository) {
    super(groupsRepository);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.getMember(context);
    return true;
  }
}
