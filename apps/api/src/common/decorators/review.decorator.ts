import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import type { GroupMovieReview as GroupMovieReviewType } from '$db/schemas';

export const Review = createParamDecorator(
  (data: keyof GroupMovieReviewType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const review = request.review as GroupMovieReviewType | undefined;
    if (!review) {
      throw new InternalServerErrorException(
        'Review decorator used without review author guard',
      );
    }
    return data ? review[data] : review;
  },
);
