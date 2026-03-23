import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { MovieAlreadyInGroupException } from '$common/exceptions';

import { GroupMoviesRepository } from './group-movies.repository';
import { MoviesRepository } from '../movies/movies.repository';
import { GroupsRepository } from '../groups/groups.repository';
import { MovieProvidersService } from '../movies/providers';
import { GroupMoviesService } from './group-movies.service';
import { AddMovieDto, GroupMovieStatus } from './dto';

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
  plannedDate: null,
  watchedDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMovie = {
  id: 100,
  externalId: 'kp123',
  imdbId: 'tt1234567',
  title: 'Test Movie',
  originalTitle: 'Test Movie',
  year: 2024,
  description: 'A test movie',
  posterUrl: 'https://example.com/poster.jpg',
  ratingKp: 8.5,
  ratingImdb: 8.0,
  genres: ['Drama'],
  countries: ['USA'],
  duration: 120,
  premiereRussia: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockRepositories = () => ({
  groupMoviesRepository: {
    create: jest.fn(),
    findByGroup: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  moviesRepository: {
    findById: jest.fn(),
    findByImdbId: jest.fn(),
    findByExternalId: jest.fn(),
    create: jest.fn(),
  },
  movieProvidersService: {
    getProvider: jest.fn(),
  },
  groupsRepository: {
    getGroupWithMember: jest.fn(),
  },
});

describe('GroupMoviesService', () => {
  let service: GroupMoviesService;
  let mocks: ReturnType<typeof createMockRepositories>;

  beforeEach(async () => {
    mocks = createMockRepositories();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMoviesService,
        {
          provide: GroupMoviesRepository,
          useValue: mocks.groupMoviesRepository,
        },
        {
          provide: MoviesRepository,
          useValue: mocks.moviesRepository,
        },
        {
          provide: MovieProvidersService,
          useValue: mocks.movieProvidersService,
        },
        {
          provide: GroupsRepository,
          useValue: mocks.groupsRepository,
        },
      ],
    }).compile();

    service = module.get<GroupMoviesService>(GroupMoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addProviderMovie', () => {
    const mockProvider = {
      findByImdbId: jest.fn(),
      getMovieDetails: jest.fn(),
      mapToNewMovie: jest.fn(),
    };

    beforeEach(() => {
      mocks.movieProvidersService.getProvider.mockReturnValue(mockProvider);
    });

    it('should find existing movie by imdbId and add to group', async () => {
      mocks.moviesRepository.findByImdbId.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue(mockGroupMovie);

      const result = await service.addProviderMovie(
        1,
        { imdbId: 'tt1234567' } as AddMovieDto,
        1,
      );

      expect(result).toEqual(mockGroupMovie);
      expect(mocks.moviesRepository.findByImdbId).toHaveBeenCalledWith(
        'tt1234567',
      );
    });

    it('should find existing movie by externalId and add to group', async () => {
      mocks.moviesRepository.findByExternalId.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue(mockGroupMovie);

      const result = await service.addProviderMovie(
        1,
        { externalId: 'kp123' } as AddMovieDto,
        1,
      );

      expect(result).toEqual(mockGroupMovie);
      expect(mocks.moviesRepository.findByExternalId).toHaveBeenCalledWith(
        'kp123',
      );
    });

    it('should throw MovieAlreadyInGroupException if movie already in group', async () => {
      mocks.moviesRepository.findByImdbId.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(true);

      await expect(
        service.addProviderMovie(1, { imdbId: 'tt1234567' } as AddMovieDto, 1),
      ).rejects.toThrow(MovieAlreadyInGroupException);
    });

    it('should import new movie via provider if not found', async () => {
      const providerMovieData = { title: 'New Movie', imdbId: 'tt9999999' };
      const newMovie = { ...mockMovie, id: 101, imdbId: 'tt9999999' };

      mocks.moviesRepository.findByImdbId.mockResolvedValue(null);
      mockProvider.findByImdbId.mockResolvedValue(providerMovieData);
      mockProvider.mapToNewMovie.mockReturnValue({
        externalId: null,
        imdbId: 'tt9999999',
        title: 'New Movie',
        originalTitle: 'New Movie',
        year: 2024,
        description: null,
        posterUrl: null,
        ratingKp: null,
        ratingImdb: null,
        genres: [],
        countries: [],
        duration: null,
        premiereRussia: null,
      });
      mocks.moviesRepository.create.mockResolvedValue(newMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue({
        ...mockGroupMovie,
        movieId: 101,
      });

      const result = await service.addProviderMovie(
        1,
        { imdbId: 'tt9999999' } as AddMovieDto,
        1,
      );

      expect(result.movieId).toBe(101);
      expect(mockProvider.findByImdbId).toHaveBeenCalledWith('tt9999999');
      expect(mocks.moviesRepository.create).toHaveBeenCalled();
    });

    it('should import new movie by externalId via provider if not found', async () => {
      const providerMovieData = {
        title: 'External Movie',
        externalId: 'kp999',
      };
      const newMovie = { ...mockMovie, id: 102, externalId: 'kp999' };

      mocks.moviesRepository.findByExternalId.mockResolvedValue(null);
      mockProvider.getMovieDetails.mockResolvedValue(providerMovieData);
      mockProvider.mapToNewMovie.mockReturnValue({
        externalId: 'kp999',
        imdbId: null,
        title: 'External Movie',
        originalTitle: 'External Movie',
        year: 2024,
        description: null,
        posterUrl: null,
        ratingKp: null,
        ratingImdb: null,
        genres: [],
        countries: [],
        duration: null,
        premiereRussia: null,
      });
      mocks.moviesRepository.create.mockResolvedValue(newMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue({
        ...mockGroupMovie,
        movieId: 102,
      });

      const result = await service.addProviderMovie(
        1,
        { externalId: 'kp999' } as AddMovieDto,
        1,
      );

      expect(result.movieId).toBe(102);
      expect(mockProvider.getMovieDetails).toHaveBeenCalledWith('kp999');
    });
  });

  describe('createCustomMovie', () => {
    it('should create custom movie in group', async () => {
      const customMovie = {
        ...mockGroupMovie,
        source: 'custom' as const,
        movieId: null,
        title: 'My Custom Movie',
      };
      mocks.groupMoviesRepository.create.mockResolvedValue(customMovie);

      const result = await service.createCustomMovie(
        1,
        { title: 'My Custom Movie', status: GroupMovieStatus.TRACKING },
        1,
      );

      expect(result).toEqual(customMovie);
      expect(mocks.groupMoviesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: 1,
          source: 'custom',
          movieId: null,
          title: 'My Custom Movie',
          addedBy: 1,
        }),
      );
    });

    it('should create custom movie with all fields', async () => {
      const fullCustomMovie = {
        ...mockGroupMovie,
        source: 'custom' as const,
        movieId: null,
        title: 'Full Custom Movie',
        overview: 'Description',
        releaseYear: 2023,
        runtime: 150,
        status: GroupMovieStatus.PLANNED,
        plannedDate: new Date('2024-06-01'),
      };
      mocks.groupMoviesRepository.create.mockResolvedValue(fullCustomMovie);

      const result = await service.createCustomMovie(
        1,
        {
          title: 'Full Custom Movie',
          overview: 'Description',
          releaseYear: 2023,
          runtime: 150,
          status: GroupMovieStatus.PLANNED,
          plannedDate: '2024-06-01T00:00:00Z',
        },
        1,
      );

      expect(result.title).toBe('Full Custom Movie');
      expect(mocks.groupMoviesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          overview: 'Description',
          releaseYear: 2023,
          runtime: 150,
          status: GroupMovieStatus.PLANNED,
        }),
      );
    });
  });

  describe('findOrCreateMovie', () => {
    const mockProvider = {
      findByImdbId: jest.fn(),
      getMovieDetails: jest.fn(),
      mapToNewMovie: jest.fn(),
    };

    beforeEach(() => {
      mocks.movieProvidersService.getProvider.mockReturnValue(mockProvider);
    });

    it('should return existing movie if found by imdbId', async () => {
      mocks.moviesRepository.findByImdbId.mockResolvedValue(mockMovie);

      const result = await service.findOrCreateMovie({
        imdbId: 'tt1234567',
      } as AddMovieDto);

      expect(result).toEqual(mockMovie);
      expect(mocks.moviesRepository.findByImdbId).toHaveBeenCalledWith(
        'tt1234567',
      );
    });

    it('should return existing movie if found by externalId', async () => {
      mocks.moviesRepository.findByExternalId.mockResolvedValue(mockMovie);

      const result = await service.findOrCreateMovie({
        externalId: 'kp123',
      } as AddMovieDto);

      expect(result).toEqual(mockMovie);
      expect(mocks.moviesRepository.findByExternalId).toHaveBeenCalledWith(
        'kp123',
      );
    });

    it('should import movie by imdbId if not found locally', async () => {
      const providerMovieData = {
        title: 'Imported Movie',
        imdbId: 'tt9999999',
      };
      const importedMovie = { ...mockMovie, id: 101, imdbId: 'tt9999999' };

      mocks.moviesRepository.findByImdbId.mockResolvedValue(null);
      mockProvider.findByImdbId.mockResolvedValue(providerMovieData);
      mockProvider.mapToNewMovie.mockReturnValue({
        externalId: null,
        imdbId: 'tt9999999',
        title: 'Imported Movie',
        originalTitle: 'Imported Movie',
        year: 2024,
        description: null,
        posterUrl: null,
        ratingKp: null,
        ratingImdb: null,
        genres: [],
        countries: [],
        duration: null,
        premiereRussia: null,
      });
      mocks.moviesRepository.create.mockResolvedValue(importedMovie);

      const result = await service.findOrCreateMovie({
        imdbId: 'tt9999999',
      } as AddMovieDto);

      expect(result).toEqual(importedMovie);
      expect(mockProvider.findByImdbId).toHaveBeenCalledWith('tt9999999');
    });

    it('should import movie by externalId if not found locally', async () => {
      const providerMovieData = {
        title: 'Imported Movie',
        externalId: 'kp999',
      };
      const importedMovie = { ...mockMovie, id: 102, externalId: 'kp999' };

      mocks.moviesRepository.findByExternalId.mockResolvedValue(null);
      mockProvider.getMovieDetails.mockResolvedValue(providerMovieData);
      mockProvider.mapToNewMovie.mockReturnValue({
        externalId: 'kp999',
        imdbId: null,
        title: 'Imported Movie',
        originalTitle: 'Imported Movie',
        year: 2024,
        description: null,
        posterUrl: null,
        ratingKp: null,
        ratingImdb: null,
        genres: [],
        countries: [],
        duration: null,
        premiereRussia: null,
      });
      mocks.moviesRepository.create.mockResolvedValue(importedMovie);

      const result = await service.findOrCreateMovie({
        externalId: 'kp999',
      } as AddMovieDto);

      expect(result).toEqual(importedMovie);
      expect(mockProvider.getMovieDetails).toHaveBeenCalledWith('kp999');
    });
  });

  describe('findByGroup', () => {
    it('should return movies for group', async () => {
      const mockGroupMovies = [mockGroupMovie];
      mocks.groupMoviesRepository.findByGroup.mockResolvedValue(
        mockGroupMovies,
      );

      const result = await service.findByGroup(1);

      expect(result).toEqual(mockGroupMovies);
      expect(mocks.groupMoviesRepository.findByGroup).toHaveBeenCalledWith(
        1,
        undefined,
        undefined,
      );
    });

    it('should filter by status', async () => {
      const mockGroupMovies = [
        { ...mockGroupMovie, status: GroupMovieStatus.WATCHED },
      ];
      mocks.groupMoviesRepository.findByGroup.mockResolvedValue(
        mockGroupMovies,
      );

      const result = await service.findByGroup(1, 'watched');

      expect(result[0].status).toBe(GroupMovieStatus.WATCHED);
      expect(mocks.groupMoviesRepository.findByGroup).toHaveBeenCalledWith(
        1,
        'watched',
        undefined,
      );
    });

    it('should filter by query', async () => {
      const mockGroupMovies = [{ ...mockGroupMovie, title: 'Matrix' }];
      mocks.groupMoviesRepository.findByGroup.mockResolvedValue(
        mockGroupMovies,
      );

      const result = await service.findByGroup(1, undefined, 'matrix');

      expect(result[0].title).toBe('Matrix');
      expect(mocks.groupMoviesRepository.findByGroup).toHaveBeenCalledWith(
        1,
        undefined,
        'matrix',
      );
    });
  });

  describe('findOne', () => {
    it('should return group movie with user role', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupsRepository.getGroupWithMember.mockResolvedValue({
        member: { role: 'admin' },
      });

      const result = await service.findOne(1, 100, 1);

      expect(result).toEqual({ ...mockGroupMovie, currentUserRole: 'admin' });
      expect(mocks.groupMoviesRepository.findOne).toHaveBeenCalledWith(1, 100);
    });

    it('should return default role for non-member', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupsRepository.getGroupWithMember.mockResolvedValue(null);

      const result = await service.findOne(1, 100, 1);

      expect(result.currentUserRole).toBe('member');
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return group movie by id', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);

      const result = await service.findById(1, 1);

      expect(result).toEqual(mockGroupMovie);
      expect(mocks.groupMoviesRepository.findOne).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update status and dates', async () => {
      const updatedGroupMovie = {
        ...mockGroupMovie,
        status: GroupMovieStatus.WATCHED,
        watchedDate: new Date('2024-12-25'),
      };
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupMoviesRepository.update.mockResolvedValue(updatedGroupMovie);

      const result = await service.update(1, 100, {
        status: GroupMovieStatus.WATCHED,
        watchedDate: '2024-12-25T20:00:00Z',
      });

      expect(result).toEqual(updatedGroupMovie);
      expect(mocks.groupMoviesRepository.update).toHaveBeenCalledWith(
        1,
        100,
        expect.objectContaining({
          status: GroupMovieStatus.WATCHED,
          watchedDate: expect.any(Date),
        }),
      );
    });

    it('should update movie data fields', async () => {
      const updatedGroupMovie = {
        ...mockGroupMovie,
        title: 'Updated Title',
        overview: 'New overview',
      };
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupMoviesRepository.update.mockResolvedValue(updatedGroupMovie);

      const result = await service.update(1, 100, {
        title: 'Updated Title',
        overview: 'New overview',
      });

      expect(result.title).toBe('Updated Title');
      expect(result.overview).toBe('New overview');
      expect(mocks.groupMoviesRepository.update).toHaveBeenCalledWith(
        1,
        100,
        expect.objectContaining({
          title: 'Updated Title',
          overview: 'New overview',
        }),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, 999, { status: GroupMovieStatus.WATCHED }),
      ).rejects.toThrow(NotFoundException);
    });

    it.each([
      GroupMovieStatus.TRACKING,
      GroupMovieStatus.PLANNED,
      GroupMovieStatus.WATCHED,
    ])('should update status to %s', async (status) => {
      const updatedGroupMovie = { ...mockGroupMovie, status };
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupMoviesRepository.update.mockResolvedValue(updatedGroupMovie);

      const result = await service.update(1, 100, { status });

      expect(result.status).toBe(status);
    });
  });

  describe('remove', () => {
    it('should remove movie from group', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupMoviesRepository.delete.mockResolvedValue(undefined);

      await service.remove(1, 100);

      expect(mocks.groupMoviesRepository.delete).toHaveBeenCalledWith(1, 100);
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
