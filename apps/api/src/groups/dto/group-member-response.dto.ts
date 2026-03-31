import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { GroupMemberRole } from '$common/enums';

export class GroupMemberResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  groupId: number;

  @Expose()
  @ApiProperty()
  userId: number;

  @Expose()
  @ApiProperty({ enum: GroupMemberRole })
  role: GroupMemberRole;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional()
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
