import { IsOptional, IsString, Matches, Validate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MovieIdRequired {
  validate(value: AddMovieDto) {
    return !!(value && (value.imdbId || value.externalId));
  }

  defaultMessage() {
    return 'Either imdbId or externalId must be provided';
  }
}

export class AddMovieDto {
  @ApiProperty({
    description: 'IMDb ID (universal, takes priority)',
    example: 'tt0133093',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^tt\d{7,8}$/)
  imdbId?: string;

  @ApiPropertyOptional({
    description: 'Provider external ID',
    example: '301',
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  @Validate(MovieIdRequired, {
    message: 'Either imdbId or externalId must be provided',
  })
  validateCombination() {}
}
