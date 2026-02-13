import {
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { MovieStatus, MovieStatusEnum } from '$common/dto/movie-status.dto';
import { IsValidMovieStatus } from '$common/validators';

export class UpdateCustomMovieDto {
  @ApiPropertyOptional({ description: 'Movie title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Poster path or URL' })
  @IsOptional()
  @IsString()
  posterPath?: string;

  @ApiPropertyOptional({ description: 'Movie overview/description' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Release year', example: 2024 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  releaseYear?: number;

  @ApiPropertyOptional({ description: 'Runtime in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  runtime?: number;

  @ApiPropertyOptional({
    description: 'Movie status',
    enum: MovieStatusEnum,
  })
  @IsOptional()
  @IsEnum(MovieStatusEnum)
  status?: MovieStatus;

  @ApiPropertyOptional({
    description: 'Planned watch date (ISO 8601)',
    example: '2024-12-31T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({
    description: 'Watched date (ISO 8601)',
    example: '2024-12-31T22:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  watchedDate?: string;

  @IsValidMovieStatus()
  validateStatus?() {}
}
