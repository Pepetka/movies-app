import { Injectable, Logger } from '@nestjs/common';

import {
  ReviewNotFoundException,
  ReviewAlreadyExistsException,
  MovieNotWatchedException,
  CannotReactToOwnReviewException,
  ReactionAlreadyExistsException,
  ReactionNotFoundException,
} from '$common/exceptions';
import { GroupMovie, NewGroupMovieReview, GroupMovieReview } from '$db/schemas';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { isUniqueViolation } from '$common/utils';
import { GroupMovieStatus } from '$common/enums';

import {
  GroupMovieReviewReactionsRepository,
  type ReviewReactionWithUser,
} from './group-movie-review-reactions.repository';
import {
  GroupMovieReviewsRepository,
  type GroupMovieReviewWithUser,
} from './group-movie-reviews.repository';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewResponseDto,
  ReviewReactionResponseDto,
} from './dto';
import { ReviewResponseMapper } from './mappers/review-response.mapper';

@Injectable()
export class GroupMovieReviewsService {
  private readonly _logger = new Logger(GroupMovieReviewsService.name);

  constructor(
    private readonly groupMovieReviewsRepository: GroupMovieReviewsRepository,
    private readonly groupMovieReviewReactionsRepository: GroupMovieReviewReactionsRepository,
    private readonly groupMoviesService: GroupMoviesService,
  ) {}

  async create(
    groupId: number,
    groupMovieId: number,
    userId: number,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
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
      return ReviewResponseMapper.mapToResponseDto(review, userId);
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
    existingReview: GroupMovieReview,
  ): Promise<ReviewResponseDto> {
    const groupMovie = await this._verifyGroupMovieOrThrow(
      groupId,
      groupMovieId,
    );

    if (groupMovie.status !== GroupMovieStatus.WATCHED) {
      throw new MovieNotWatchedException();
    }

    if (existingReview.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    const updateData: Partial<NewGroupMovieReview> = {};

    if (dto.rating != null) {
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
    return this.mapToResponseDto(updated, userId);
  }

  async delete(
    id: number,
    groupId: number,
    groupMovieId: number,
    userId: number,
    existingReview: GroupMovieReview,
  ): Promise<void> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);

    if (existingReview.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    await this.groupMovieReviewsRepository.delete(id);

    this._logger.log(`Review ${id} deleted by user ${userId}`);
  }

  async getStatsByGroupMovieIds(
    groupMovieIds: number[],
  ): Promise<Map<number, { averageRating: number | null; count: number }>> {
    return this.groupMovieReviewsRepository.getStatsByGroupMovieIds(
      groupMovieIds,
    );
  }

  async findByGroupMovieUnsafe(
    groupMovieId: number,
  ): Promise<GroupMovieReviewWithUser[]> {
    return this.groupMovieReviewsRepository.findByGroupMovie(groupMovieId);
  }

  async addReaction(
    groupId: number,
    reviewId: number,
    groupMovieId: number,
    userId: number,
    emoji: string,
  ): Promise<ReviewReactionResponseDto> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);

    const review = await this.groupMovieReviewsRepository.findOne(reviewId);

    if (!review || review.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    if (review.userId === userId) {
      throw new CannotReactToOwnReviewException();
    }

    try {
      const reaction = await this.groupMovieReviewReactionsRepository.create({
        reviewId,
        userId,
        emoji,
      });

      this._logger.log(
        `Reaction ${emoji} added to review ${reviewId} by user ${userId}`,
      );

      return Object.assign(new ReviewReactionResponseDto(), {
        ...reaction,
        isOwn: true,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ReactionAlreadyExistsException();
      }
      throw error;
    }
  }

  async removeReaction(
    groupId: number,
    reviewId: number,
    groupMovieId: number,
    userId: number,
  ): Promise<void> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);

    const review = await this.groupMovieReviewsRepository.findOne(reviewId);

    if (!review || review.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    const reaction =
      await this.groupMovieReviewReactionsRepository.findByReviewAndUser(
        reviewId,
        userId,
      );

    if (!reaction) {
      throw new ReactionNotFoundException();
    }

    await this.groupMovieReviewReactionsRepository.delete(reaction.id);

    this._logger.log(
      `Reaction removed from review ${reviewId} by user ${userId}`,
    );
  }

  async getReactionsByReviewIds(
    reviewIds: number[],
  ): Promise<Map<number, ReviewReactionWithUser[]>> {
    const reactions =
      await this.groupMovieReviewReactionsRepository.findByReviewIds(reviewIds);

    const map = new Map<number, ReviewReactionWithUser[]>();
    for (const reaction of reactions) {
      const list = map.get(reaction.reviewId) ?? [];
      list.push(reaction);
      map.set(reaction.reviewId, list);
    }
    return map;
  }

  private async _verifyGroupMovieOrThrow(
    groupId: number,
    groupMovieId: number,
  ): Promise<GroupMovie> {
    return this.groupMoviesService.findById(groupId, groupMovieId);
  }
}
