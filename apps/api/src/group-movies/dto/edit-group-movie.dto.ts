import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { MovieStatus, MovieStatusEnum } from '$common/dto/movie-status.dto';
import { IsValidMovieStatus } from '$common/validators';

export class EditGroupMovieDto {
  @ApiPropertyOptional({ description: 'Movie title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Poster path' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  posterPath?: string;

  @ApiPropertyOptional({ description: 'Movie overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Release year' })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2100)
  releaseYear?: number;

  @ApiPropertyOptional({ description: 'Runtime in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  runtime?: number;

  @ApiPropertyOptional({
    description: 'Update status (optional)',
    enum: MovieStatusEnum,
  })
  @IsOptional()
  @IsEnum(MovieStatusEnum)
  status?: MovieStatus;

  @ApiPropertyOptional({
    description: 'Update planned date (optional)',
    example: '2024-12-31T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({
    description: 'Update watched date (optional)',
    example: '2024-12-25T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  watchedDate?: string;

  @IsValidMovieStatus()
  validateStatus?() {}
}
