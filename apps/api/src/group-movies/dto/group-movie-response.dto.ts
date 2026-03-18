import { ApiProperty } from '@nestjs/swagger';

import { CustomMovieResponseDto } from '../../custom-movies/dto';

export enum GroupMovieStatus {
  TRACKING = 'tracking',
  PLANNED = 'planned',
  WATCHED = 'watched',
}

export class GroupMovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  movieId: number;

  @ApiProperty()
  addedBy: number;

  @ApiProperty({ enum: GroupMovieStatus })
  status: GroupMovieStatus;

  @ApiProperty({ type: Date, nullable: true })
  plannedDate: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  watchedDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

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

  @ApiProperty({ type: String, nullable: true })
  rating: string | null;
}

export class SearchInGroupResponseDto {
  @ApiProperty()
  provider: Record<string, unknown>;

  @ApiProperty({ type: [CustomMovieResponseDto] })
  currentGroup: CustomMovieResponseDto[];
}
