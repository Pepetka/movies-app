import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import type { UserRequest } from '$src/auth/types/user-request.type';
import { NotReviewAuthorException } from '$common/exceptions';
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
      throw new ForbiddenException('Access denied');
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
      throw new ForbiddenException('Review not found');
    }

    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new NotReviewAuthorException();
    }

    return true;
  }
}
