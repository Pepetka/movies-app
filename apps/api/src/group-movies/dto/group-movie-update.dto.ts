import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsValidMovieStatus } from '$common/validators';

import { GroupMovieStatus } from './group-movie-response.dto';

export class GroupMovieUpdateDto {
  // Status fields
  @ApiPropertyOptional({
    description: 'Movie status in group',
    enum: GroupMovieStatus,
  })
  @IsOptional()
  @IsEnum(GroupMovieStatus)
  status?: GroupMovieStatus;

  @ApiPropertyOptional({
    description: 'Watch date (planned or actual, depending on status)',
    example: '2024-12-31T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  watchDate?: string;

  // Movie data fields (for editing)
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

  @IsValidMovieStatus()
  validateStatus?() {}
}
