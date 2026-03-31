import { IsString, Length, Matches } from 'class-validator';

export class InviteTokenParamDto {
  @IsString()
  @Length(32, 32)
  @Matches(/^[0-9a-f]+$/)
  token: string;
}
