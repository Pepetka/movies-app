import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CsrfResponseDto {
  @ApiProperty()
  @IsString()
  token: string;
}
