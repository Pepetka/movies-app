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
import { ApiProperty } from '@nestjs/swagger';

import { IsValidMovieStatus } from '$common/validators';
import { GroupMovieStatus } from '$common/enums';

export class CreateCustomMovieDto {
  @ApiProperty({ description: 'Movie title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Poster path', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  posterPath?: string;

  @ApiProperty({ description: 'Movie overview', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  overview?: string;

  @ApiProperty({ description: 'Release year', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2100)
  releaseYear?: number;

  @ApiProperty({ description: 'Runtime in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  runtime?: number;

  @ApiProperty({
    description: 'Movie status',
    enum: GroupMovieStatus,
    default: GroupMovieStatus.TRACKING,
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupMovieStatus)
  status?: GroupMovieStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Watch date (planned or actual, depending on status)',
    example: '2024-12-31T20:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  watchDate?: string | null;

  @IsValidMovieStatus()
  validateStatus?() {}
}
