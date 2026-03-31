import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteResponseDto {
  @ApiProperty()
  groupId: number;
}
