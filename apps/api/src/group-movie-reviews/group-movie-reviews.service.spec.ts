import { Test, TestingModule } from '@nestjs/testing';

import {
  ReviewNotFoundException,
  ReviewAlreadyExistsException,
  MovieNotWatchedException,
  CannotReactToOwnReviewException,
  ReactionAlreadyExistsException,
  ReactionNotFoundException,
} from '$common/exceptions';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';

import { GroupMovieReviewReactionsRepository } from './group-movie-review-reactions.repository';
import { GroupMovieReviewsRepository } from './group-movie-reviews.repository';
import { GroupMovieReviewsService } from './group-movie-reviews.service';

const mockReview = {
  id: 1,
  groupMovieId: 1,
  userId: 1,
  rating: '4.5',
  text: 'Great movie',
  userName: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReaction = {
  id: 1,
  reviewId: 1,
  userId: 2,
  emoji: '👍',
  userName: 'Other User',
  userAvatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockRepositories = () => ({
  groupMovieReviewsRepository: {
    findByUserAndGroupMovie: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStatsByGroupMovieIds: jest.fn(),
  },
  groupMovieReviewReactionsRepository: {
    findByReviewIds: jest.fn(),
    findByReviewAndUser: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  groupMoviesService: {
    findById: jest.fn(),
  },
});

describe('GroupMovieReviewsService', () => {
  let service: GroupMovieReviewsService;
  let mocks: ReturnType<typeof createMockRepositories>;

  beforeEach(async () => {
    mocks = createMockRepositories();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMovieReviewsService,
        {
          provide: GroupMovieReviewsRepository,
          useValue: mocks.groupMovieReviewsRepository,
        },
        {
          provide: GroupMovieReviewReactionsRepository,
          useValue: mocks.groupMovieReviewReactionsRepository,
        },
        {
          provide: GroupMoviesService,
          useValue: mocks.groupMoviesService,
        },
      ],
    }).compile();

    service = module.get<GroupMovieReviewsService>(GroupMovieReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByUserAndGroupMovie.mockResolvedValue(
        null,
      );
      mocks.groupMovieReviewsRepository.create.mockResolvedValue(mockReview);

      const result = await service.create(1, 1, 1, {
        rating: 4.5,
        text: 'Great movie',
      });

      expect(result).toEqual({
        ...mockReview,
        rating: 4.5,
        isOwn: true,
        reactions: [],
      });
      expect(mocks.groupMoviesService.findById).toHaveBeenCalledWith(1, 1);
      expect(mocks.groupMovieReviewsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          groupMovieId: 1,
          userId: 1,
          rating: '4.5',
          text: 'Great movie',
        }),
      );
    });

    it('should throw ReviewAlreadyExistsException if review exists', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByUserAndGroupMovie.mockResolvedValue(
        mockReview,
      );

      await expect(service.create(1, 1, 1, { rating: 4.5 })).rejects.toThrow(
        ReviewAlreadyExistsException,
      );
    });

    it('should throw MovieNotWatchedException if movie is not watched', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'tracking',
      });

      await expect(service.create(1, 1, 1, { rating: 4.5 })).rejects.toThrow(
        MovieNotWatchedException,
      );
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.update.mockResolvedValue({
        ...mockReview,
        rating: '5.0',
        text: 'Updated text',
      });
      mocks.groupMovieReviewReactionsRepository.findByReviewIds.mockResolvedValue(
        [],
      );

      const result = await service.update(
        1,
        1,
        1,
        1,
        {
          rating: 5.0,
          text: 'Updated text',
        },
        mockReview,
      );

      expect(result.rating).toBe(5);
      expect(result.text).toBe('Updated text');
      expect(result.reactions).toEqual([]);
      expect(mocks.groupMovieReviewsRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          rating: '5',
          text: 'Updated text',
        }),
      );
    });

    it('should throw MovieNotWatchedException if movie is not watched', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'planned',
      });

      await expect(
        service.update(1, 1, 1, 1, { rating: 5.0 }, mockReview),
      ).rejects.toThrow(MovieNotWatchedException);
    });

    it('should throw ReviewNotFoundException if review belongs to another group movie', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });

      await expect(
        service.update(
          1,
          1,
          1,
          1,
          { rating: 5.0 },
          { ...mockReview, groupMovieId: 999 },
        ),
      ).rejects.toThrow(ReviewNotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.delete.mockResolvedValue(undefined);

      await service.delete(1, 1, 1, 1, mockReview);

      expect(mocks.groupMovieReviewsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ReviewNotFoundException if review belongs to another group movie', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });

      await expect(
        service.delete(1, 1, 1, 1, { ...mockReview, groupMovieId: 999 }),
      ).rejects.toThrow(ReviewNotFoundException);
    });
  });

  describe('getStatsByGroupMovieIds', () => {
    it('should return stats map', async () => {
      const stats = new Map([
        [1, { averageRating: 4.5, count: 3 }],
        [2, { averageRating: 3.0, count: 1 }],
      ]);
      mocks.groupMovieReviewsRepository.getStatsByGroupMovieIds.mockResolvedValue(
        stats,
      );

      const result = await service.getStatsByGroupMovieIds([1, 2, 3]);

      expect(result).toBe(stats);
      expect(
        mocks.groupMovieReviewsRepository.getStatsByGroupMovieIds,
      ).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  describe('addReaction', () => {
    it('should create a reaction', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);
      mocks.groupMovieReviewReactionsRepository.create.mockResolvedValue(
        mockReaction,
      );

      const result = await service.addReaction(1, 1, 1, 2, '👍');

      expect(result).toEqual({
        ...mockReaction,
        isOwn: true,
      });
      expect(
        mocks.groupMovieReviewReactionsRepository.create,
      ).toHaveBeenCalledWith({
        reviewId: 1,
        userId: 2,
        emoji: '👍',
      });
    });

    it('should throw ReviewNotFoundException if review does not exist', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(null);

      await expect(service.addReaction(1, 999, 1, 2, '👍')).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should throw ReviewNotFoundException if review belongs to another group movie', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        groupMovieId: 999,
      });

      await expect(service.addReaction(1, 1, 1, 2, '👍')).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should throw CannotReactToOwnReviewException for own review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);

      await expect(service.addReaction(1, 1, 1, 1, '👍')).rejects.toThrow(
        CannotReactToOwnReviewException,
      );
    });

    it('should throw ReactionAlreadyExistsException on unique violation', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);
      const error = new Error('Unique violation') as Error & { code: string };
      error.code = '23505';
      mocks.groupMovieReviewReactionsRepository.create.mockRejectedValue(error);

      await expect(service.addReaction(1, 1, 1, 2, '❤️')).rejects.toThrow(
        ReactionAlreadyExistsException,
      );
    });
  });

  describe('removeReaction', () => {
    it('should delete a reaction', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);
      mocks.groupMovieReviewReactionsRepository.findByReviewAndUser.mockResolvedValue(
        mockReaction,
      );
      mocks.groupMovieReviewReactionsRepository.delete.mockResolvedValue(
        undefined,
      );

      await service.removeReaction(1, 1, 1, 2);

      expect(
        mocks.groupMovieReviewReactionsRepository.delete,
      ).toHaveBeenCalledWith(mockReaction.id);
    });

    it('should throw ReviewNotFoundException if review does not exist', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(null);

      await expect(service.removeReaction(1, 999, 1, 2)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should throw ReviewNotFoundException if review belongs to another group movie', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        groupMovieId: 999,
      });

      await expect(service.removeReaction(1, 1, 1, 2)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should throw ReactionNotFoundException if reaction does not exist', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);
      mocks.groupMovieReviewReactionsRepository.findByReviewAndUser.mockResolvedValue(
        null,
      );

      await expect(service.removeReaction(1, 1, 1, 2)).rejects.toThrow(
        ReactionNotFoundException,
      );
    });
  });

  describe('getReactionsByReviewIds', () => {
    it('should return reactions grouped by reviewId', async () => {
      const reactions = [
        { ...mockReaction, reviewId: 1 },
        { ...mockReaction, id: 2, reviewId: 1, emoji: '❤️' },
        { ...mockReaction, id: 3, reviewId: 2 },
      ];
      mocks.groupMovieReviewReactionsRepository.findByReviewIds.mockResolvedValue(
        reactions,
      );

      const result = await service.getReactionsByReviewIds([1, 2]);

      expect(result.get(1)).toHaveLength(2);
      expect(result.get(2)).toHaveLength(1);
      expect(
        mocks.groupMovieReviewReactionsRepository.findByReviewIds,
      ).toHaveBeenCalledWith([1, 2]);
    });

    it('should return empty map for empty input', async () => {
      mocks.groupMovieReviewReactionsRepository.findByReviewIds.mockResolvedValue(
        [],
      );

      const result = await service.getReactionsByReviewIds([]);

      expect(result.size).toBe(0);
    });
  });
});
