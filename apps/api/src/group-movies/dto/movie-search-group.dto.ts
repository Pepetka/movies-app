import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { MovieSearchFiltersBaseDto } from '../../movies/dto/movie-search-filters-base.dto';

export class MovieSearchGroupDto extends MovieSearchFiltersBaseDto {
  @ApiProperty({ description: 'Search query', example: 'матрица' })
  @IsString()
  @MaxLength(200)
  query: string;

  @ApiProperty({
    description: 'Page number (for provider results)',
    required: false,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
}
