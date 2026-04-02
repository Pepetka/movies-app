import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InviteTokenResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
  })
  inviteToken: string | null;
}
