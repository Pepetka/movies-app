import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { GroupMemberRole } from '$common/enums';

export class GroupMemberAddDto {
  @ApiProperty({ example: 1, description: 'User ID to add to the group' })
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: GroupMemberRole.MEMBER,
    description: 'Role in the group (member or moderator)',
    enum: [GroupMemberRole.MEMBER, GroupMemberRole.MODERATOR],
    required: false,
  })
  @IsOptional()
  @IsIn([GroupMemberRole.MEMBER, GroupMemberRole.MODERATOR], {
    message: `role must be one of: ${GroupMemberRole.MEMBER}, ${GroupMemberRole.MODERATOR}`,
  })
  role?: GroupMemberRole;
}
