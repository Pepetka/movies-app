import { Test, TestingModule } from '@nestjs/testing';

import {
  ReviewNotFoundException,
  ReviewAlreadyExistsException,
  NotReviewAuthorException,
  MovieNotWatchedException,
} from '$common/exceptions';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { UserRole } from '$common/enums';

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
    findByGroupMovie: jest.fn(),
    findByUserAndGroupMovie: jest.fn(),
    findOne: jest.fn(),
    findOneWithUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAverageRating: jest.fn(),
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

  describe('findByGroupMovie', () => {
    it('should return reviews for a group movie', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByGroupMovie.mockResolvedValue([
        mockReview,
      ]);

      const result = await service.findByGroupMovie(1, 1);

      expect(result).toEqual([mockReview]);
      expect(mocks.groupMoviesService.findById).toHaveBeenCalledWith(1, 1);
      expect(
        mocks.groupMovieReviewsRepository.findByGroupMovie,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('findMyReview', () => {
    it('should return user review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByUserAndGroupMovie.mockResolvedValue(
        mockReview,
      );

      const result = await service.findMyReview(1, 1, 1);

      expect(result).toEqual(mockReview);
      expect(mocks.groupMoviesService.findById).toHaveBeenCalledWith(1, 1);
      expect(
        mocks.groupMovieReviewsRepository.findByUserAndGroupMovie,
      ).toHaveBeenCalledWith(1, 1);
    });

    it('should return null if review not found', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByUserAndGroupMovie.mockResolvedValue(
        null,
      );

      const result = await service.findMyReview(1, 1, 1);

      expect(result).toBeNull();
    });
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

      expect(result).toEqual(mockReview);
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
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);
      mocks.groupMovieReviewsRepository.update.mockResolvedValue({
        ...mockReview,
        rating: '5.0',
        text: 'Updated text',
      });

      const result = await service.update(1, 1, 1, 1, UserRole.USER, {
        rating: 5.0,
        text: 'Updated text',
      });

      expect(result.rating).toBe('5.0');
      expect(result.text).toBe('Updated text');
      expect(mocks.groupMovieReviewsRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          rating: '5',
          text: 'Updated text',
        }),
      );
    });

    it('should throw ReviewNotFoundException if review not found', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, 1, 1, 1, UserRole.USER, { rating: 5.0 }),
      ).rejects.toThrow(ReviewNotFoundException);
    });

    it('should throw MovieNotWatchedException if movie is not watched', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'planned',
      });

      await expect(
        service.update(1, 1, 1, 1, UserRole.USER, { rating: 5.0 }),
      ).rejects.toThrow(MovieNotWatchedException);
    });

    it('should throw ReviewNotFoundException if review belongs to another group movie', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        groupMovieId: 999,
      });

      await expect(
        service.update(1, 1, 1, 1, UserRole.USER, { rating: 5.0 }),
      ).rejects.toThrow(ReviewNotFoundException);
    });

    it('should throw NotReviewAuthorException for non-owner non-admin', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        userId: 2,
      });

      await expect(
        service.update(1, 1, 1, 1, UserRole.USER, { rating: 5.0 }),
      ).rejects.toThrow(NotReviewAuthorException);
    });

    it('should allow admin to update any review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        userId: 2,
      });
      mocks.groupMovieReviewsRepository.update.mockResolvedValue({
        ...mockReview,
        userId: 2,
        rating: '5.0',
      });

      const result = await service.update(1, 1, 1, 1, UserRole.ADMIN, {
        rating: 5.0,
      });

      expect(result.rating).toBe('5.0');
    });
  });

  describe('delete', () => {
    it('should delete a review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(mockReview);
      mocks.groupMovieReviewsRepository.delete.mockResolvedValue(undefined);

      await service.delete(1, 1, 1, 1, UserRole.USER);

      expect(mocks.groupMovieReviewsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ReviewNotFoundException if review not found', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(1, 1, 1, 1, UserRole.USER)).rejects.toThrow(
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

      await expect(service.delete(1, 1, 1, 1, UserRole.USER)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });

    it('should throw NotReviewAuthorException for non-owner non-admin', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        userId: 2,
      });

      await expect(service.delete(1, 1, 1, 1, UserRole.USER)).rejects.toThrow(
        NotReviewAuthorException,
      );
    });

    it('should allow admin to delete any review', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findOne.mockResolvedValue({
        ...mockReview,
        userId: 2,
      });
      mocks.groupMovieReviewsRepository.delete.mockResolvedValue(undefined);

      await service.delete(1, 1, 1, 1, UserRole.ADMIN);

      expect(mocks.groupMovieReviewsRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating', async () => {
      mocks.groupMovieReviewsRepository.getAverageRating.mockResolvedValue(4.5);

      const result = await service.getAverageRating(1);

      expect(result).toBe(4.5);
    });

    it('should return null if no reviews', async () => {
      mocks.groupMovieReviewsRepository.getAverageRating.mockResolvedValue(
        null,
      );

      const result = await service.getAverageRating(1);

      expect(result).toBeNull();
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

  describe('findAll', () => {
    it('should return review list with average rating', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByGroupMovie.mockResolvedValue([
        mockReview,
      ]);
      mocks.groupMovieReviewsRepository.getAverageRating.mockResolvedValue(4.5);

      const result = await service.findAll(1, 1);

      expect(result).toEqual({
        items: [mockReview],
        averageRating: 4.5,
        totalCount: 1,
      });
    });

    it('should return null averageRating if no reviews', async () => {
      mocks.groupMoviesService.findById.mockResolvedValue({
        status: 'watched',
      });
      mocks.groupMovieReviewsRepository.findByGroupMovie.mockResolvedValue([]);
      mocks.groupMovieReviewsRepository.getAverageRating.mockResolvedValue(
        null,
      );

      const result = await service.findAll(1, 1);

      expect(result).toEqual({
        items: [],
        averageRating: null,
        totalCount: 0,
      });
    });
  });
});
