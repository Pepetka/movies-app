import { IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsLessThanOrEqual } from '$common/validators';

import { MovieSearchOrder } from '../providers/interfaces/movie-search-filters';

const MIN_RATING = 0;
const MAX_RATING = 10;
const MIN_YEAR = 1000;
const MAX_YEAR = 2100;

export abstract class MovieSearchFiltersBaseDto {
  @ApiProperty({
    description: 'Sort order',
    enum: MovieSearchOrder,
    default: MovieSearchOrder.YEAR,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieSearchOrder)
  order?: MovieSearchOrder;

  @ApiProperty({
    description: 'Minimum rating (0-10)',
    minimum: MIN_RATING,
    maximum: MAX_RATING,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  @IsLessThanOrEqual('ratingTo')
  ratingFrom?: number;

  @ApiProperty({
    description: 'Maximum rating (0-10)',
    minimum: MIN_RATING,
    maximum: MAX_RATING,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  ratingTo?: number;

  @ApiProperty({
    description: 'Minimum year',
    minimum: MIN_YEAR,
    maximum: MAX_YEAR,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_YEAR)
  @Max(MAX_YEAR)
  @IsLessThanOrEqual('yearTo')
  yearFrom?: number;

  @ApiProperty({
    description: 'Maximum year',
    minimum: MIN_YEAR,
    maximum: MAX_YEAR,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_YEAR)
  @Max(MAX_YEAR)
  yearTo?: number;
}
