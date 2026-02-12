import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MovieAlreadyExistsException } from '$common/exceptions';

import { MoviesRepository } from './movies.repository';
import { MovieProvidersService } from './providers';
import { MoviesService } from './movies.service';
import { MovieCreateDto } from './dto';

const mockMovie = {
  id: 1,
  externalId: 'kp123',
  imdbId: 'tt1234567',
  title: 'Test Movie',
  posterPath: '/poster.jpg',
  overview: 'Description',
  releaseYear: 2024,
  rating: '8.5',
  runtime: 120,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProvider = {
  search: jest.fn(),
  findByImdbId: jest.fn(),
  getMovieDetails: jest.fn(),
  mapToNewMovie: jest.fn(),
};

const createMocks = () => ({
  moviesRepository: {
    findById: jest.fn(),
    findByImdbId: jest.fn(),
    findByExternalId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  movieProvidersService: {
    getProvider: jest.fn().mockReturnValue(mockProvider),
  },
});

describe('MoviesService', () => {
  let service: MoviesService;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    mocks = createMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: MoviesRepository, useValue: mocks.moviesRepository },
        {
          provide: MovieProvidersService,
          useValue: mocks.movieProvidersService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return search results', async () => {
      const searchResult = { movies: [mockMovie], page: 1, totalPages: 1 };
      mockProvider.search.mockResolvedValue(searchResult);

      const result = await service.search({ query: 'matrix' });

      expect(result).toEqual(searchResult);
    });
  });

  describe('create', () => {
    it('should create movie by imdbId', async () => {
      const providerDetails = { title: 'New Movie', imdbId: 'tt9999999' };
      const newMovieData = {
        externalId: 'kp999',
        imdbId: 'tt9999999',
        title: 'New Movie',
      };

      mocks.moviesRepository.findByImdbId.mockResolvedValue(null);
      mockProvider.findByImdbId.mockResolvedValue(providerDetails);
      mockProvider.mapToNewMovie.mockReturnValue(newMovieData);
      mocks.moviesRepository.create.mockResolvedValue({
        id: 2,
        ...newMovieData,
      });

      const result = await service.create({
        imdbId: 'tt9999999',
      } as MovieCreateDto);

      expect(result.imdbId).toBe('tt9999999');
    });

    it('should create movie by externalId', async () => {
      const providerDetails = { title: 'New Movie', externalId: 'kp999' };
      const newMovieData = { externalId: 'kp999', title: 'New Movie' };

      mocks.moviesRepository.findByExternalId.mockResolvedValue(null);
      mockProvider.getMovieDetails.mockResolvedValue(providerDetails);
      mockProvider.mapToNewMovie.mockReturnValue(newMovieData);
      mocks.moviesRepository.create.mockResolvedValue({
        id: 2,
        ...newMovieData,
      });

      const result = await service.create({
        externalId: 'kp999',
      } as MovieCreateDto);

      expect(result.externalId).toBe('kp999');
    });

    it('should throw MovieAlreadyExistsException if imdbId exists', async () => {
      mocks.moviesRepository.findByImdbId.mockResolvedValue(mockMovie);

      await expect(
        service.create({ imdbId: 'tt1234567' } as MovieCreateDto),
      ).rejects.toThrow(MovieAlreadyExistsException);
    });

    it('should throw MovieAlreadyExistsException if externalId exists', async () => {
      mocks.moviesRepository.findByExternalId.mockResolvedValue(mockMovie);

      await expect(
        service.create({ externalId: 'kp123' } as MovieCreateDto),
      ).rejects.toThrow(MovieAlreadyExistsException);
    });

    it('should throw BadRequestException if no id provided', async () => {
      await expect(service.create({} as MovieCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return movies list', async () => {
      mocks.moviesRepository.findAll.mockResolvedValue([mockMovie]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return movie', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update movie', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.moviesRepository.update.mockResolvedValue({
        ...mockMovie,
        title: 'Updated',
      });

      const result = await service.update(1, { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete movie', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.moviesRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
