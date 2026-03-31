import { ApiProperty } from '@nestjs/swagger';

export class InviteTokenResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  })
  inviteToken: string;
}
