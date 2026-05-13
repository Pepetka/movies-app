import { Injectable, Logger } from '@nestjs/common';

import {
  ReviewNotFoundException,
  ReviewAlreadyExistsException,
  MovieNotWatchedException,
} from '$common/exceptions';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { GroupMovie, NewGroupMovieReview } from '$db/schemas';
import { isUniqueViolation } from '$common/utils';
import { GroupMovieStatus } from '$common/enums';

import {
  GroupMovieReviewsRepository,
  type GroupMovieReviewWithUser,
} from './group-movie-reviews.repository';
import { CreateReviewDto, UpdateReviewDto, ReviewListResponseDto } from './dto';

@Injectable()
export class GroupMovieReviewsService {
  private readonly _logger = new Logger(GroupMovieReviewsService.name);

  constructor(
    private readonly groupMovieReviewsRepository: GroupMovieReviewsRepository,
    private readonly groupMoviesService: GroupMoviesService,
  ) {}

  async findByGroupMovie(
    groupId: number,
    groupMovieId: number,
  ): Promise<GroupMovieReviewWithUser[]> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);
    return this.groupMovieReviewsRepository.findByGroupMovie(groupMovieId);
  }

  async findMyReview(
    groupId: number,
    groupMovieId: number,
    userId: number,
  ): Promise<GroupMovieReviewWithUser | null> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);
    return this.groupMovieReviewsRepository.findByUserAndGroupMovie(
      userId,
      groupMovieId,
    );
  }

  async findMyReviewOrThrow(
    groupId: number,
    groupMovieId: number,
    userId: number,
  ): Promise<GroupMovieReviewWithUser> {
    const review = await this.findMyReview(groupId, groupMovieId, userId);
    if (!review) {
      throw new ReviewNotFoundException();
    }
    return review;
  }

  async create(
    groupId: number,
    groupMovieId: number,
    userId: number,
    dto: CreateReviewDto,
  ): Promise<GroupMovieReviewWithUser> {
    const groupMovie = await this._verifyGroupMovieOrThrow(
      groupId,
      groupMovieId,
    );

    if (groupMovie.status !== GroupMovieStatus.WATCHED) {
      throw new MovieNotWatchedException();
    }

    const existing =
      await this.groupMovieReviewsRepository.findByUserAndGroupMovie(
        userId,
        groupMovieId,
      );

    if (existing) {
      throw new ReviewAlreadyExistsException();
    }

    const data: NewGroupMovieReview = {
      groupMovieId,
      userId,
      rating: dto.rating.toString(),
      text: dto.text ?? null,
    };

    try {
      const review = await this.groupMovieReviewsRepository.create(data);
      this._logger.log(
        `Review created for group movie ${groupMovieId} by user ${userId}`,
      );
      return review;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ReviewAlreadyExistsException();
      }
      throw error;
    }
  }

  async update(
    id: number,
    groupId: number,
    groupMovieId: number,
    userId: number,
    dto: UpdateReviewDto,
  ): Promise<GroupMovieReviewWithUser> {
    const groupMovie = await this._verifyGroupMovieOrThrow(
      groupId,
      groupMovieId,
    );

    if (groupMovie.status !== GroupMovieStatus.WATCHED) {
      throw new MovieNotWatchedException();
    }

    const review = await this.groupMovieReviewsRepository.findOne(id);

    if (!review || review.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    const updateData: Partial<NewGroupMovieReview> = {};

    if (dto.rating !== undefined) {
      updateData.rating = dto.rating.toString();
    }
    if (dto.text !== undefined) {
      updateData.text = dto.text ?? null;
    }

    const updated = await this.groupMovieReviewsRepository.update(
      id,
      updateData,
    );

    this._logger.log(`Review ${id} updated by user ${userId}`);
    return updated;
  }

  async delete(
    id: number,
    groupId: number,
    groupMovieId: number,
    userId: number,
  ): Promise<void> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);

    const review = await this.groupMovieReviewsRepository.findOne(id);

    if (!review || review.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    await this.groupMovieReviewsRepository.delete(id);

    this._logger.log(`Review ${id} deleted by user ${userId}`);
  }

  async getAverageRating(groupMovieId: number): Promise<number | null> {
    return this.groupMovieReviewsRepository.getAverageRating(groupMovieId);
  }

  async getStatsByGroupMovieIds(
    groupMovieIds: number[],
  ): Promise<Map<number, { averageRating: number | null; count: number }>> {
    return this.groupMovieReviewsRepository.getStatsByGroupMovieIds(
      groupMovieIds,
    );
  }

  async findAll(
    groupId: number,
    groupMovieId: number,
  ): Promise<ReviewListResponseDto> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);

    const [items, averageRating] = await Promise.all([
      this.groupMovieReviewsRepository.findByGroupMovie(groupMovieId),
      this.groupMovieReviewsRepository.getAverageRating(groupMovieId),
    ]);

    return {
      items,
      averageRating,
      totalCount: items.length,
    };
  }

  async findByGroupMovieUnsafe(
    groupMovieId: number,
  ): Promise<GroupMovieReviewWithUser[]> {
    return this.groupMovieReviewsRepository.findByGroupMovie(groupMovieId);
  }

  async findMyReviewUnsafe(
    userId: number,
    groupMovieId: number,
  ): Promise<GroupMovieReviewWithUser | null> {
    return this.groupMovieReviewsRepository.findByUserAndGroupMovie(
      userId,
      groupMovieId,
    );
  }

  private async _verifyGroupMovieOrThrow(
    groupId: number,
    groupMovieId: number,
  ): Promise<GroupMovie> {
    return this.groupMoviesService.findById(groupId, groupMovieId);
  }
}
