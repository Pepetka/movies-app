import { Module } from '@nestjs/common';

import { DbModule } from '$db/db.module';

import {
  GroupAdminGuard,
  GroupMemberGuard,
  GroupModeratorGuard,
} from './guards';
import { InvitesController } from './invites.controller';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';

@Module({
  imports: [DbModule],
  controllers: [GroupsController, InvitesController],
  providers: [
    GroupsService,
    GroupsRepository,
    GroupMemberGuard,
    GroupModeratorGuard,
    GroupAdminGuard,
  ],
  exports: [
    GroupsService,
    GroupsRepository,
    GroupMemberGuard,
    GroupModeratorGuard,
    GroupAdminGuard,
  ],
})
export class GroupsModule {}
