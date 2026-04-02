import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { INVITE_TOKEN_BYTES } from '../invite-token.constants';

export class InviteTokenParamDto {
  @ApiProperty({
    description: 'Invite token (32 hex chars)',
    minLength: 32,
    maxLength: 32,
  })
  @IsString()
  @Length(INVITE_TOKEN_BYTES * 2)
  @Matches(/^[0-9a-f]+$/)
  token: string;
}
