import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { GroupMovie } from '$db/schemas';

import { CustomMoviesRepository } from './custom-movies.repository';
import { MoviesRepository } from '../movies/movies.repository';
import { CustomMoviesService } from './custom-movies.service';

const mockCustomMovie = {
  id: 1,
  groupId: 1,
  createdById: 1,
  title: 'Test Custom Movie',
  posterPath: null,
  overview: null,
  releaseYear: null,
  runtime: null,
  status: 'tracking',
  plannedDate: null,
  watchedDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMovie = {
  id: 100,
  externalId: 'kp123',
  imdbId: 'tt1234567',
  title: 'Provider Movie',
  posterPath: '/poster.jpg',
  overview: 'Description',
  releaseYear: 2024,
  runtime: 120,
};

const mockGroupMovie: GroupMovie = {
  id: 1,
  groupId: 1,
  movieId: 100,
  addedBy: 1,
  status: 'watched',
  plannedDate: new Date('2024-01-15'),
  watchedDate: new Date('2024-02-20'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockRepositories = () => ({
  customMoviesRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByGroup: jest.fn(),
    findByUserGroups: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  moviesRepository: {
    findById: jest.fn(),
  },
});

describe('CustomMoviesService', () => {
  let service: CustomMoviesService;
  let mocks: ReturnType<typeof createMockRepositories>;

  beforeEach(async () => {
    mocks = createMockRepositories();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomMoviesService,
        {
          provide: CustomMoviesRepository,
          useValue: mocks.customMoviesRepository,
        },
        {
          provide: MoviesRepository,
          useValue: mocks.moviesRepository,
        },
      ],
    }).compile();

    service = module.get<CustomMoviesService>(CustomMoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create custom movie', async () => {
      mocks.customMoviesRepository.create.mockResolvedValue(mockCustomMovie);

      const result = await service.create(1, 1, { title: 'Test Movie' });

      expect(result).toEqual(mockCustomMovie);
    });

    it('should handle dates correctly', async () => {
      mocks.customMoviesRepository.create.mockResolvedValue({
        ...mockCustomMovie,
        status: 'watched',
        watchedDate: new Date('2024-02-20'),
      });

      const result = await service.create(1, 1, {
        title: 'Test',
        status: 'watched',
        watchedDate: '2024-02-20T20:00:00Z',
      });

      expect(result.status).toBe('watched');
      expect(result.watchedDate).toBeInstanceOf(Date);
    });
  });

  describe('findByGroup', () => {
    it('should return movies for group', async () => {
      mocks.customMoviesRepository.findByGroup.mockResolvedValue([
        mockCustomMovie,
      ]);

      const result = await service.findByGroup(1);

      expect(result).toHaveLength(1);
    });
  });

  describe('findByUserGroups', () => {
    it('should return movies for user groups', async () => {
      mocks.customMoviesRepository.findByUserGroups.mockResolvedValue([
        mockCustomMovie,
      ]);

      const result = await service.findByUserGroups(1);

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return movie', async () => {
      mocks.customMoviesRepository.findById.mockResolvedValue(mockCustomMovie);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockCustomMovie);
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.customMoviesRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if wrong group', async () => {
      mocks.customMoviesRepository.findById.mockResolvedValue(mockCustomMovie);

      await expect(service.findOne(1, 999)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update movie', async () => {
      const updated = { ...mockCustomMovie, title: 'Updated' };
      mocks.customMoviesRepository.findById.mockResolvedValue(mockCustomMovie);
      mocks.customMoviesRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, 1, { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.customMoviesRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, 1, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete movie', async () => {
      mocks.customMoviesRepository.findById.mockResolvedValue(mockCustomMovie);
      mocks.customMoviesRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove(1, 1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mocks.customMoviesRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('convertFromGroupMovie', () => {
    it('should convert groupMovie to customMovie', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.customMoviesRepository.create.mockResolvedValue(mockCustomMovie);

      const result = await service.convertFromGroupMovie(mockGroupMovie, {});

      expect(result).toEqual(mockCustomMovie);
    });

    it('should use override data', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(mockMovie);
      mocks.customMoviesRepository.create.mockResolvedValue({
        ...mockCustomMovie,
        title: 'Custom Title',
      });

      const result = await service.convertFromGroupMovie(mockGroupMovie, {
        title: 'Custom Title',
      });

      expect(result.title).toBe('Custom Title');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mocks.moviesRepository.findById.mockResolvedValue(null);

      await expect(
        service.convertFromGroupMovie(mockGroupMovie, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
