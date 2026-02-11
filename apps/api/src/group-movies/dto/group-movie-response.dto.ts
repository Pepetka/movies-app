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

  @ApiProperty({ required: false })
  plannedDate?: Date;

  @ApiProperty({ required: false })
  watchedDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SearchInGroupResponseDto {
  @ApiProperty()
  provider: Record<string, unknown>;

  @ApiProperty({ type: [CustomMovieResponseDto] })
  currentGroup: CustomMovieResponseDto[];
}
