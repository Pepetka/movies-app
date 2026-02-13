import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MovieStatus, MovieStatusEnum } from '$common/dto/movie-status.dto';

export class CustomMovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  posterPath?: string;

  @ApiPropertyOptional()
  overview?: string;

  @ApiPropertyOptional()
  releaseYear?: number;

  @ApiPropertyOptional()
  runtime?: number;

  @ApiProperty({
    description: 'Movie status',
    enum: MovieStatusEnum,
    default: 'tracking',
  })
  status: MovieStatus;

  @ApiPropertyOptional()
  plannedDate?: Date;

  @ApiPropertyOptional()
  watchedDate?: Date;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
