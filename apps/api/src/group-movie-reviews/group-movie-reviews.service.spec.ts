import { Test, TestingModule } from '@nestjs/testing';

import {
  ReviewNotFoundException,
  ReviewAlreadyExistsException,
  MovieNotWatchedException,
} from '$common/exceptions';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';

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

const createMockRepositories = () => ({
  groupMovieReviewsRepository: {
    findByUserAndGroupMovie: jest.fn(),
    findOne: jest.fn(),

    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStatsByGroupMovieIds: jest.fn(),
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
});
