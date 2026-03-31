import { IsString, Length, Matches } from 'class-validator';

import { INVITE_TOKEN_BYTES } from '../invite-token.constants';

export class InviteTokenParamDto {
  @IsString()
  @Length(INVITE_TOKEN_BYTES * 2)
  @Matches(/^[0-9a-f]+$/)
  token: string;
}
