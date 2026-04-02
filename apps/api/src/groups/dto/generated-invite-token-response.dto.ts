import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GeneratedInviteTokenResponseDto {
  @Expose()
  @ApiProperty({ type: String })
  inviteToken: string;
}
