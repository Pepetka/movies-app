import { IsString, Length, Matches } from 'class-validator';

export const INVITE_TOKEN_LENGTH = 32;

export class InviteTokenParamDto {
  @IsString()
  @Length(INVITE_TOKEN_LENGTH, INVITE_TOKEN_LENGTH)
  @Matches(/^[0-9a-f]+$/)
  token: string;
}
