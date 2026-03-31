import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InviteTokenResponseDto {
  @Expose()
  @ApiProperty({
    example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  })
  inviteToken: string;
}
