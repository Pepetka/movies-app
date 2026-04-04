import {
  IsString,
  IsNotEmpty,
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
  @IsNotEmpty()
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
    type: String,
    nullable: true,
    description: 'Watch date (planned or actual, depending on status)',
    example: '2024-12-31T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  watchDate?: string | null;

  @IsValidMovieStatus()
  validateStatus?() {}
}
