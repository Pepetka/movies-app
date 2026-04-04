import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  groupId: number;

  @Expose()
  @ApiProperty({ enum: MovieSource })
  source: MovieSource;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  movieId: number | null;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  overview: string | null;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  runtime: number | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  rating: string | null;

  @Expose()
  @ApiProperty()
  addedBy: number;

  @Expose()
  @ApiProperty({ enum: GroupMovieStatus })
  status: GroupMovieStatus;

  @Expose()
  @ApiProperty({ type: Date, nullable: true })
  watchDate: Date | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ enum: GroupMemberRole, required: false })
  currentUserRole?: GroupMemberRole;
}

export class SearchInGroupResponseDto {
  @Expose()
  @ApiProperty({ type: ProviderSearchResult })
  provider: ProviderSearchResult;

  @Expose()
  @ApiProperty({ type: [GroupMovieResponseDto] })
  currentGroup: GroupMovieResponseDto[];
}
