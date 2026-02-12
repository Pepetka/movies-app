import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { MovieAlreadyInGroupException } from '$common/exceptions';

import { GroupMoviesRepository } from './group-movies.repository';
import { MoviesRepository } from '../movies/movies.repository';
import { MovieProvidersService } from '../movies/providers';
import { GroupMoviesService } from './group-movies.service';
import { AddMovieDto, GroupMovieStatus } from './dto';

const mockGroupMovie = {
  id: 1,
  groupId: 1,
  movieId: 100,
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
    countByMovie: jest.fn(),
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
      ],
    }).compile();

    service = module.get<GroupMoviesService>(GroupMoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMovie', () => {
    it('should add movie to group', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue(mockGroupMovie);

      const result = await service.addMovie(1, 100, 1);

      expect(result).toEqual(mockGroupMovie);
      expect(mocks.groupMoviesRepository.create).toHaveBeenCalledWith({
        groupId: 1,
        movieId: 100,
        addedBy: 1,
        status: GroupMovieStatus.TRACKING,
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(null);

      await expect(service.addMovie(1, 999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw MovieAlreadyInGroupException if movie already in group', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(true);

      await expect(service.addMovie(1, 100, 1)).rejects.toThrow(
        MovieAlreadyInGroupException,
      );
    });
  });

  describe('addMovieByDto', () => {
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
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue(mockGroupMovie);

      const result = await service.addMovieByDto(
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
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue(mockGroupMovie);

      const result = await service.addMovieByDto(
        1,
        { externalId: 'kp123' } as AddMovieDto,
        1,
      );

      expect(result).toEqual(mockGroupMovie);
      expect(mocks.moviesRepository.findByExternalId).toHaveBeenCalledWith(
        'kp123',
      );
    });

    it('should import new movie via provider if not found', async () => {
      const providerMovieData = { title: 'New Movie', imdbId: 'tt9999999' };
      const newMovie = { ...mockMovie, id: 101, imdbId: 'tt9999999' };

      mocks.moviesRepository.findByImdbId.mockResolvedValue(null);
      mocks.moviesRepository.findById.mockResolvedValue(newMovie);
      mocks.groupMoviesRepository.exists.mockResolvedValue(false);
      mocks.groupMoviesRepository.create.mockResolvedValue({
        ...mockGroupMovie,
        movieId: 101,
      });

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

      const result = await service.addMovieByDto(
        1,
        { imdbId: 'tt9999999' } as AddMovieDto,
        1,
      );

      expect(result.movieId).toBe(101);
      expect(mockProvider.findByImdbId).toHaveBeenCalledWith('tt9999999');
      expect(mocks.moviesRepository.create).toHaveBeenCalled();
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
      expect(mocks.groupMoviesRepository.findByGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return group movie', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);

      const result = await service.findOne(1, 100);

      expect(result).toEqual(mockGroupMovie);
      expect(mocks.groupMoviesRepository.findOne).toHaveBeenCalledWith(1, 100);
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
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

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, 999, { status: GroupMovieStatus.WATCHED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove movie from group', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(mockGroupMovie);
      mocks.groupMoviesRepository.delete.mockResolvedValue(undefined);
      mocks.groupMoviesRepository.countByMovie.mockResolvedValue(0);

      await service.remove(1, 100);

      expect(mocks.groupMoviesRepository.delete).toHaveBeenCalledWith(1, 100);
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.groupMoviesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
