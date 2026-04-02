import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { GroupMemberRole } from '$common/enums';

export class GroupMemberUserDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;
}

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
  @ApiProperty({ type: GroupMemberUserDto })
  user: GroupMemberUserDto;
}
