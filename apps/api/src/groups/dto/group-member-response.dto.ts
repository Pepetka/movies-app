import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { GroupMemberRole } from '$common/enums';

export class GroupMemberResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: GroupMemberRole })
  role: GroupMemberRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
