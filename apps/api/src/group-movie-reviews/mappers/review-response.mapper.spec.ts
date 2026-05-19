import type { ReviewReactionWithUser } from '../group-movie-review-reactions.repository';
import type { GroupMovieReviewWithUser } from '../group-movie-reviews.repository';
import { ReviewResponseMapper } from './review-response.mapper';

const mockReview = (
  overrides?: Partial<GroupMovieReviewWithUser>,
): GroupMovieReviewWithUser => ({
  id: 1,
  groupMovieId: 10,
  userId: 100,
  rating: '4.5',
  text: 'Great movie',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  userName: 'Test User',
  userAvatar: null,
  ...overrides,
});

const mockReaction = (
  overrides?: Partial<ReviewReactionWithUser>,
): ReviewReactionWithUser => ({
  id: 1,
  reviewId: 1,
  userId: 200,
  emoji: '👍',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  userName: 'Reactor',
  userAvatar: null,
  ...overrides,
});

describe('ReviewResponseMapper', () => {
  describe('mapToResponseDto', () => {
    it('should map review and mark as own when userId matches', () => {
      const review = mockReview({ userId: 100 });
      const result = ReviewResponseMapper.mapToResponseDto(review, 100);

      expect(result.id).toBe(review.id);
      expect(result.rating).toBe(4.5);
      expect(result.isOwn).toBe(true);
      expect(result.reactions).toEqual([]);
    });

    it('should mark as not own when userId differs', () => {
      const review = mockReview({ userId: 100 });
      const result = ReviewResponseMapper.mapToResponseDto(review, 200);

      expect(result.isOwn).toBe(false);
    });

    it('should mark as not own when userId is undefined', () => {
      const review = mockReview();
      const result = ReviewResponseMapper.mapToResponseDto(review);

      expect(result.isOwn).toBe(false);
    });

    it('should convert rating string to number', () => {
      const review = mockReview({ rating: '5.0' });
      const result = ReviewResponseMapper.mapToResponseDto(review);

      expect(result.rating).toBe(5);
    });

    it('should map reactions with correct isOwn flag', () => {
      const review = mockReview({ userId: 100 });
      const reactions = [
        mockReaction({ userId: 100, emoji: '❤️' }),
        mockReaction({ userId: 200, emoji: '👍' }),
      ];

      const result = ReviewResponseMapper.mapToResponseDto(
        review,
        100,
        reactions,
      );

      expect(result.reactions).toHaveLength(2);
      expect(result.reactions[0].emoji).toBe('❤️');
      expect(result.reactions[0].isOwn).toBe(true);
      expect(result.reactions[1].emoji).toBe('👍');
      expect(result.reactions[1].isOwn).toBe(false);
    });
  });

  describe('mapReactionToDto', () => {
    it('should map reaction and mark as own when userId matches', () => {
      const reaction = mockReaction({ userId: 100 });
      const result = ReviewResponseMapper.mapReactionToDto(reaction, 100);

      expect(result.id).toBe(reaction.id);
      expect(result.emoji).toBe('👍');
      expect(result.isOwn).toBe(true);
    });

    it('should mark as not own when userId differs', () => {
      const reaction = mockReaction({ userId: 100 });
      const result = ReviewResponseMapper.mapReactionToDto(reaction, 200);

      expect(result.isOwn).toBe(false);
    });

    it('should mark as not own when userId is undefined', () => {
      const reaction = mockReaction();
      const result = ReviewResponseMapper.mapReactionToDto(reaction);

      expect(result.isOwn).toBe(false);
    });
  });
});
