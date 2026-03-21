import { ApiProperty } from '@nestjs/swagger';

import { ProviderSearchResult } from '$src/movies/providers/interfaces/provider-result.dto';
import { GroupMemberRole } from '$common/enums';

export enum GroupMovieStatus {
  TRACKING = 'tracking',
  PLANNED = 'planned',
  WATCHED = 'watched',
}

export enum MovieSource {
  PROVIDER = 'provider',
  CUSTOM = 'custom',
}

export class GroupMovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty({ enum: MovieSource })
  source: MovieSource;

  @ApiProperty({ type: Number, nullable: true })
  movieId: number | null;

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

  @ApiProperty({ enum: GroupMemberRole, required: false })
  currentUserRole?: GroupMemberRole;
}

export class SearchInGroupResponseDto {
  @ApiProperty({ type: ProviderSearchResult })
  provider: ProviderSearchResult;

  @ApiProperty({ type: [GroupMovieResponseDto] })
  currentGroup: GroupMovieResponseDto[];
}
