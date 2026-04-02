import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { GroupMemberRole } from '$common/enums';

export class GroupResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ enum: GroupMemberRole, required: false })
  currentUserRole?: GroupMemberRole;
}
