import { Test, TestingModule } from '@nestjs/testing';

import { GroupMovieReviewsService } from '$src/group-movie-reviews/group-movie-reviews.service';
import { GroupMoviesService } from '$src/group-movies/group-movies.service';
import { GroupMemberRole, GroupMovieStatus } from '$common/enums';

import { GroupMovieDetailsService } from './group-movie-details.service';

const mockGroupMovie = {
  id: 1,
  groupId: 1,
  source: 'provider' as const,
  movieId: 100,
  title: 'Test Movie',
  posterPath: null,
  overview: null,
  releaseYear: 2024,
  runtime: 120,
  rating: '8.5',
  addedBy: 1,
  status: GroupMovieStatus.TRACKING,
  watchDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockServices = () => ({
  groupMoviesService: {
    findByGroup: jest.fn(),
    searchInGroup: jest.fn(),
    findById: jest.fn(),
  },
  groupMovieReviewsService: {
    findByGroupMovieUnsafe: jest.fn(),
    getAverageRating: jest.fn(),
    getStatsByGroupMovieIds: jest.fn(),
  },
});

describe('GroupMovieDetailsService', () => {
  let service: GroupMovieDetailsService;
  let mocks: ReturnType<typeof createMockServices>;

  beforeEach(async () => {
    mocks = createMockServices();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMovieDetailsService,
        {
          provide: GroupMoviesService,
          useValue: mocks.groupMoviesService,
        },
        {
          provide: GroupMovieReviewsService,
          useValue: mocks.groupMovieReviewsService,
        },
      ],
    }).compile();

    service = module.get<GroupMovieDetailsService>(GroupMovieDetailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return movies enriched with review stats', async () => {
      const movies = [
        { ...mockGroupMovie, id: 1 },
        { ...mockGroupMovie, id: 2 },
      ];
      mocks.groupMoviesService.findByGroup.mockResolvedValue(movies);
      const stats = new Map([
        [1, { averageRating: 4.5, count: 3 }],
        [2, { averageRating: null, count: 0 }],
      ]);
      mocks.groupMovieReviewsService.getStatsByGroupMovieIds.mockResolvedValue(
        stats,
      );

      const result = await service.findAll(1);

      expect(result).toHaveLength(2);
      expect(result[0].averageRating).toBe(4.5);
      expect(result[0].reviewCount).toBe(3);
      expect(result[1].averageRating).toBeNull();
      expect(result[1].reviewCount).toBe(0);
      expect(mocks.groupMoviesService.findByGroup).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });

    it('should pass options to findByGroup', async () => {
      mocks.groupMoviesService.findByGroup.mockResolvedValue([]);
      mocks.groupMovieReviewsService.getStatsByGroupMovieIds.mockResolvedValue(
        new Map(),
      );

      await service.findAll(1, { status: GroupMovieStatus.WATCHED });

      expect(mocks.groupMoviesService.findByGroup).toHaveBeenCalledWith(1, {
        status: GroupMovieStatus.WATCHED,
      });
    });

    it('should return empty array when no movies', async () => {
      mocks.groupMoviesService.findByGroup.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
      expect(
        mocks.groupMovieReviewsService.getStatsByGroupMovieIds,
      ).not.toHaveBeenCalled();
    });
  });

  describe('searchInGroup', () => {
    it('should return search results enriched with review stats', async () => {
      const providerResult = {
        page: 1,
        totalPages: 1,
        totalResults: 0,
        results: [],
      };
      const groupMovies = [{ ...mockGroupMovie, id: 1 }];
      mocks.groupMoviesService.searchInGroup.mockResolvedValue({
        provider: providerResult,
        currentGroup: groupMovies,
      });
      const stats = new Map([[1, { averageRating: 5.0, count: 1 }]]);
      mocks.groupMovieReviewsService.getStatsByGroupMovieIds.mockResolvedValue(
        stats,
      );

      const dto = { query: 'test', page: 1 };
      const result = await service.searchInGroup(1, dto);

      expect(result.provider).toEqual(providerResult);
      expect(result.currentGroup[0].averageRating).toBe(5.0);
      expect(result.currentGroup[0].reviewCount).toBe(1);
    });

    it('should return empty currentGroup when no group movies', async () => {
      const providerResult = {
        page: 1,
        totalPages: 1,
        totalResults: 0,
        results: [],
      };
      mocks.groupMoviesService.searchInGroup.mockResolvedValue({
        provider: providerResult,
        currentGroup: [],
      });

      const result = await service.searchInGroup(1, { query: 'test' });

      expect(result.currentGroup).toEqual([]);
      expect(
        mocks.groupMovieReviewsService.getStatsByGroupMovieIds,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return movie details with reviews and rating', async () => {
      const review = {
        id: 1,
        groupMovieId: 1,
        userId: 1,
        rating: '4.5',
        text: 'Great',
        userName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mocks.groupMoviesService.findById.mockResolvedValue(mockGroupMovie);
      mocks.groupMovieReviewsService.findByGroupMovieUnsafe.mockResolvedValue([
        review,
      ]);
      mocks.groupMovieReviewsService.getAverageRating.mockResolvedValue(4.5);

      const result = await service.findOne(1, 1, GroupMemberRole.MEMBER, 1);

      expect(result).toMatchObject({
        ...mockGroupMovie,
        currentUserRole: GroupMemberRole.MEMBER,
        averageRating: 4.5,
        reviewCount: 1,
        reviews: [{ ...review, rating: 4.5, isOwn: true }],
      });
    });

    it('should mark review as not own for different user', async () => {
      const review = {
        id: 1,
        groupMovieId: 1,
        userId: 2,
        rating: '4.5',
        text: 'Great',
        userName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mocks.groupMoviesService.findById.mockResolvedValue(mockGroupMovie);
      mocks.groupMovieReviewsService.findByGroupMovieUnsafe.mockResolvedValue([
        review,
      ]);
      mocks.groupMovieReviewsService.getAverageRating.mockResolvedValue(4.5);

      const result = await service.findOne(1, 1, GroupMemberRole.MEMBER, 1);

      expect(result.reviews?.[0].isOwn).toBe(false);
      expect(result.reviews?.[0].rating).toBe(4.5);
    });
  });
});
