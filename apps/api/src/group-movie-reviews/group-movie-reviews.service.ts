import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import {
  ReviewNotFoundException,
  ReviewAlreadyExistsException,
  NotReviewAuthorException,
  MovieNotWatchedException,
} from '$common/exceptions';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { GroupMovieReview, NewGroupMovieReview } from '$db/schemas';
import { UserRole, GroupMovieStatus } from '$common/enums';
import { isUniqueViolation } from '$common/utils';

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
    skipVerification = false,
  ): Promise<GroupMovieReviewWithUser[]> {
    if (!skipVerification) {
      await this._verifyGroupMovieOrThrow(groupId, groupMovieId);
    }
    return this.groupMovieReviewsRepository.findByGroupMovie(groupMovieId);
  }

  async findMyReview(
    groupId: number,
    groupMovieId: number,
    userId: number,
    skipVerification = false,
  ): Promise<GroupMovieReviewWithUser | null> {
    if (!skipVerification) {
      await this._verifyGroupMovieOrThrow(groupId, groupMovieId);
    }
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
    userRole: UserRole,
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

    this._ensureOwnership(review, userId, userRole);

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
    userRole: UserRole,
  ): Promise<void> {
    await this._verifyGroupMovieOrThrow(groupId, groupMovieId);

    const review = await this.groupMovieReviewsRepository.findOne(id);

    if (!review || review.groupMovieId !== groupMovieId) {
      throw new ReviewNotFoundException();
    }

    this._ensureOwnership(review, userId, userRole);

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

  private async _verifyGroupMovieOrThrow(
    groupId: number,
    groupMovieId: number,
  ): Promise<{ status: string }> {
    const groupMovie = await this.groupMoviesService.findById(
      groupId,
      groupMovieId,
    );
    if (!groupMovie) {
      throw new NotFoundException('Group movie not found');
    }
    return groupMovie;
  }

  private _ensureOwnership(
    review: GroupMovieReview,
    userId: number,
    userRole: UserRole,
  ): void {
    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new NotReviewAuthorException();
    }
  }
}
