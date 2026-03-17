import { ApiProperty } from '@nestjs/swagger';

import { MovieStatus, MovieStatusEnum } from '$common/dto/movie-status.dto';

export class CustomMovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @ApiProperty({ type: String, nullable: true })
  overview: string | null;

  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @ApiProperty({ type: Number, nullable: true })
  runtime: number | null;

  @ApiProperty({
    description: 'Movie status',
    enum: MovieStatusEnum,
    default: 'tracking',
  })
  status: MovieStatus;

  @ApiProperty({ type: Date, nullable: true })
  plannedDate: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  watchedDate: Date | null;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
