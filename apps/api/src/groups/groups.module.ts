import { Module } from '@nestjs/common';

import { GroupMemberGuard, GroupModeratorGuard } from '$common/guards';
import { DbModule } from '$db/db.module';

import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';

@Module({
  imports: [DbModule],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    GroupsRepository,
    GroupMemberGuard,
    GroupModeratorGuard,
  ],
  exports: [GroupsService, GroupsRepository],
})
export class GroupsModule {}
