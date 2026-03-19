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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MovieStatus, MovieStatusEnum } from '$common/dto/movie-status.dto';
import { IsValidMovieStatus } from '$common/validators';

export class CreateCustomMovieDto {
  @ApiProperty({ description: 'Movie title' })
  @IsString()
  @MaxLength(255)
  title: string;

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
    description: 'Movie status',
    enum: MovieStatusEnum,
    default: 'tracking',
  })
  @IsOptional()
  @IsEnum(MovieStatusEnum)
  status?: MovieStatus;

  @ApiPropertyOptional({
    description: 'Planned watch date',
    example: '2024-12-31T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({
    description: 'Watched date',
    example: '2024-12-25T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  watchedDate?: string;

  @IsValidMovieStatus()
  validateStatus?() {}
}
