import { Injectable } from '@nestjs/common';

import {
  FindAllGroupMoviesDto,
  MovieSearchGroupDto,
  GroupMovieResponseDto,
} from '$src/group-movies/dto';
import { GroupMovieReviewsService } from '$src/group-movie-reviews/group-movie-reviews.service';
import { ProviderSearchResult } from '$src/movies/providers/interfaces/provider-result.dto';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { GroupMemberRole } from '$common/enums';
import { GroupMovie } from '$db/schemas';

const calculateAverageRating = (ratings: number[]): number | null => {
  if (ratings.length === 0) return null;
  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return Number(avg.toFixed(2));
};

export type EnrichedGroupMovie = GroupMovie & {
  averageRating?: number | null;
  reviewCount?: number;
};

@Injectable()
export class GroupMovieDetailsService {
  constructor(
    private readonly groupMoviesService: GroupMoviesService,
    private readonly groupMovieReviewsService: GroupMovieReviewsService,
  ) {}

  async findAll(
    groupId: number,
    options?: FindAllGroupMoviesDto,
  ): Promise<EnrichedGroupMovie[]> {
    const movies = await this.groupMoviesService.findByGroup(groupId, options);
    return this._enrichWithReviewStats(movies);
  }

  async searchInGroup(
    groupId: number,
    dto: MovieSearchGroupDto,
  ): Promise<{
    provider: ProviderSearchResult;
    currentGroup: EnrichedGroupMovie[];
  }> {
    const result = await this.groupMoviesService.searchInGroup(groupId, dto);
    return {
      provider: result.provider,
      currentGroup: await this._enrichWithReviewStats(result.currentGroup),
    };
  }

  async findOne(
    groupId: number,
    id: number,
    currentUserRole: GroupMemberRole,
    userId: number,
  ): Promise<GroupMovieResponseDto> {
    const groupMovie = await this.groupMoviesService.findById(groupId, id);

    const reviews =
      await this.groupMovieReviewsService.findByGroupMovieUnsafe(id);
    const averageRating = calculateAverageRating(
      reviews.map((r) => Number(r.rating)),
    );

    return Object.assign(new GroupMovieResponseDto(), {
      ...groupMovie,
      currentUserRole,
      reviews: reviews.map((r) => ({
        ...r,
        rating: Number(r.rating),
        isOwn: r.userId === userId,
      })),
      averageRating,
      reviewCount: reviews.length,
    });
  }

  private async _enrichWithReviewStats(
    movies: GroupMovie[],
  ): Promise<EnrichedGroupMovie[]> {
    if (movies.length === 0) return [];

    const ids = movies.map((m) => m.id);
    const stats =
      await this.groupMovieReviewsService.getStatsByGroupMovieIds(ids);

    return movies.map((movie) => {
      const stat = stats.get(movie.id);
      return {
        ...movie,
        averageRating: stat?.averageRating ?? null,
        reviewCount: stat?.count ?? 0,
      };
    });
  }
}
