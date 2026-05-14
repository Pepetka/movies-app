import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  NotReviewAuthorException,
  ReviewNotFoundException,
} from '$common/exceptions';
import type { UserRequest } from '$src/auth/types/user-request.type';
import { UserRole } from '$common/enums';

import { GroupMovieReviewsRepository } from '../group-movie-reviews.repository';

@Injectable()
export class ReviewAuthorGuard implements CanActivate {
  constructor(
    private readonly groupMovieReviewsRepository: GroupMovieReviewsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>();
    const userId = request.user?.id;
    const userRole = request.user?.role;

    if (!userId) {
      throw new UnauthorizedException('Access denied');
    }

    const params = request.params as {
      groupId?: string;
      groupMovieId?: string;
      id?: string;
    };

    const reviewId = params.id ? Number(params.id) : null;
    if (!reviewId || !Number.isInteger(reviewId)) {
      throw new ForbiddenException('Review ID required');
    }

    const review = await this.groupMovieReviewsRepository.findOne(reviewId);

    if (!review) {
      throw new ReviewNotFoundException();
    }

    if (review.groupMovieId !== Number(params.groupMovieId)) {
      throw new ReviewNotFoundException();
    }

    request.review = review;

    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new NotReviewAuthorException();
    }

    return true;
  }
}
