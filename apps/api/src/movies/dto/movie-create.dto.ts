import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { AtLeastOneOf } from '$common/validators';

export class MovieCreateDto {
  @ApiProperty({
    description: 'IMDb ID (universal)',
    example: 'tt0133093',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^tt\d{7,8}$/)
  @AtLeastOneOf(['imdbId', 'externalId'], {
    message: 'Either imdbId or externalId must be provided',
  })
  imdbId?: string;

  @ApiProperty({
    description: 'Provider external ID',
    example: '301',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;
}
