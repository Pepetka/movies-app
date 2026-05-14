import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ProviderSearchResult } from '$src/movies/providers/interfaces/provider-result.dto';
import { GroupMemberRole, GroupMovieStatus } from '$common/enums';
import { ReviewResponseDto } from '$src/group-movie-reviews/dto';

export const MovieSource = {
  PROVIDER: 'provider',
  CUSTOM: 'custom',
} as const;

export type MovieSource = (typeof MovieSource)[keyof typeof MovieSource];

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

  @Expose()
  @ApiProperty({ type: [ReviewResponseDto], required: false })
  @Type(() => ReviewResponseDto)
  reviews?: ReviewResponseDto[];

  @Expose()
  @Type(() => Number)
  @ApiProperty({ type: Number, nullable: true, required: false })
  averageRating?: number | null;

  @Expose()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: false })
  reviewCount?: number;
}

export class SearchInGroupResponseDto {
  @Expose()
  @ApiProperty({ type: ProviderSearchResult })
  provider: ProviderSearchResult;

  @Expose()
  @ApiProperty({ type: [GroupMovieResponseDto] })
  @Type(() => GroupMovieResponseDto)
  currentGroup: GroupMovieResponseDto[];
}
