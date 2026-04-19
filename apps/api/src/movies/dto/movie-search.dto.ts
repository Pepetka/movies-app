import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { MovieSearchFiltersBaseDto } from './movie-search-filters-base.dto';

export class MovieSearchDto extends MovieSearchFiltersBaseDto {
  @ApiProperty({ description: 'Search query', example: 'матрица' })
  @IsString()
  @MaxLength(200)
  query: string;

  @ApiProperty({
    description: 'Page number',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
}
