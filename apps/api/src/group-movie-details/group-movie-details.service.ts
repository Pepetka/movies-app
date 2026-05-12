import { Injectable } from '@nestjs/common';

import { GroupMovieReviewsService } from '$src/group-movie-reviews/group-movie-reviews.service';
import { ProviderSearchResult } from '$src/movies/providers/interfaces/provider-result.dto';
import {
  FindAllGroupMoviesDto,
  MovieSearchGroupDto,
} from '$src/group-movies/dto';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { GroupMemberRole } from '$common/enums';
import { GroupMovie } from '$db/schemas';

@Injectable()
export class GroupMovieDetailsService {
  constructor(
    private readonly groupMoviesService: GroupMoviesService,
    private readonly groupMovieReviewsService: GroupMovieReviewsService,
  ) {}

  async findAll(
    groupId: number,
    options?: FindAllGroupMoviesDto,
  ): Promise<
    (GroupMovie & { averageRating?: number | null; reviewCount?: number })[]
  > {
    const movies = await this.groupMoviesService.findByGroup(groupId, options);
    return this._enrichWithReviewStats(movies);
  }

  async searchInGroup(
    groupId: number,
    dto: MovieSearchGroupDto,
  ): Promise<{
    provider: ProviderSearchResult;
    currentGroup: (GroupMovie & {
      averageRating?: number | null;
      reviewCount?: number;
    })[];
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
  ) {
    const groupMovie = await this.groupMoviesService.findById(groupId, id);

    const [reviews, averageRating] = await Promise.all([
      this.groupMovieReviewsService.findByGroupMovie(groupId, id, true),
      this.groupMovieReviewsService.getAverageRating(id),
    ]);

    return {
      ...groupMovie,
      currentUserRole,
      reviews: reviews.map((r) => ({ ...r, isOwn: r.userId === userId })),
      averageRating,
      reviewCount: reviews.length,
    };
  }

  private async _enrichWithReviewStats(
    movies: GroupMovie[],
  ): Promise<
    (GroupMovie & { averageRating?: number | null; reviewCount?: number })[]
  > {
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
