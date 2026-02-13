import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { GroupMemberRole } from '$common/enums';

export class GroupMemberAddDto {
  @ApiProperty({ example: 1, description: 'User ID to add to the group' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({
    example: GroupMemberRole.MEMBER,
    description: 'Role in the group',
    enum: GroupMemberRole,
  })
  @IsOptional()
  @IsEnum(GroupMemberRole, {
    message: `role must be one of: ${Object.values(GroupMemberRole).join(', ')}`,
  })
  role?: GroupMemberRole;
}
