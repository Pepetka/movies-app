import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { GroupMemberRole } from '$common/enums';

export class GroupMemberRoleUpdateDto {
  @ApiProperty({
    example: GroupMemberRole.MODERATOR,
    description: 'New role for the member',
    enum: GroupMemberRole,
  })
  @IsEnum(GroupMemberRole, {
    message: `role must be one of: ${Object.values(GroupMemberRole).join(', ')}`,
  })
  role: GroupMemberRole;
}
