import type { ReviewReactionWithUser } from '../group-movie-review-reactions.repository';
import type { GroupMovieReviewWithUser } from '../group-movie-reviews.repository';
import { ReviewResponseDto, ReviewReactionResponseDto } from '../dto';

export class ReviewResponseMapper {
  static mapReactionToDto(
    reaction: ReviewReactionWithUser,
    userId?: number,
  ): ReviewReactionResponseDto {
    return Object.assign(new ReviewReactionResponseDto(), {
      ...reaction,
      isOwn: userId !== undefined ? reaction.userId === userId : false,
    });
  }

  static mapToResponseDto(
    review: GroupMovieReviewWithUser,
    userId?: number,
    reactions: ReviewReactionWithUser[] = [],
  ): ReviewResponseDto {
    return Object.assign(new ReviewResponseDto(), {
      ...review,
      rating: Number(review.rating),
      isOwn: userId !== undefined ? review.userId === userId : false,
      reactions: reactions.map((r) => this.mapReactionToDto(r, userId)),
    });
  }
}
