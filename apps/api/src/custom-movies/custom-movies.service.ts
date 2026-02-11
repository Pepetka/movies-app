import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { MovieStatus } from '$common/dto/movie-status.dto';

import { CustomMoviesRepository } from './custom-movies.repository';
import { CreateCustomMovieDto, UpdateCustomMovieDto } from './dto';
import { MoviesRepository } from '../movies/movies.repository';
import type { CustomMovie, GroupMovie } from '../db/schemas';

export interface ConvertGroupMovieData {
  title?: string;
  posterPath?: string;
  overview?: string;
  releaseYear?: number;
  runtime?: number;
  status?: MovieStatus;
  plannedDate?: string;
  watchedDate?: string;
}

@Injectable()
export class CustomMoviesService {
  private readonly _logger = new Logger(CustomMoviesService.name);

  constructor(
    private readonly customMoviesRepository: CustomMoviesRepository,
    private readonly moviesRepository: MoviesRepository,
  ) {}

  /**
   * Creates a new custom movie for a group
   * @param groupId - Group ID
   * @param createdById - User ID creating the movie
   * @param dto - Custom movie data
   * @returns Created custom movie
   */
  async create(
    groupId: number,
    createdById: number,
    dto: CreateCustomMovieDto,
  ): Promise<CustomMovie> {
    const newMovie = {
      groupId,
      createdById,
      title: dto.title,
      posterPath: dto.posterPath ?? null,
      overview: dto.overview ?? null,
      releaseYear: dto.releaseYear ?? null,
      runtime: dto.runtime ?? null,
      status: dto.status ?? 'tracking',
      plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : null,
      watchedDate: dto.watchedDate ? new Date(dto.watchedDate) : null,
    };

    const movie = await this.customMoviesRepository.create(newMovie);
    this._logger.log(
      `Custom movie created with id: ${movie.id}, status: ${movie.status}`,
    );
    return movie;
  }

  /**
   * Gets custom movies for a group with optional search
   * @param groupId - Group ID
   * @param query - Optional search query for title
   * @param limit - Max results (default: 50)
   * @param offset - Results to skip (default: 0)
   * @returns Array of custom movies
   */
  async findByGroup(
    groupId: number,
    query?: string,
    limit = 50,
    offset = 0,
  ): Promise<CustomMovie[]> {
    return this.customMoviesRepository.findByGroup(
      groupId,
      query,
      limit,
      offset,
    );
  }

  /**
   * Gets custom movies across all user's groups
   * @param userId - User ID
   * @param query - Optional search query for title
   * @param limit - Max results (default: 50)
   * @param offset - Results to skip (default: 0)
   * @returns Array of custom movies
   */
  async findByUserGroups(
    userId: number,
    query?: string,
    limit = 50,
    offset = 0,
  ): Promise<CustomMovie[]> {
    return this.customMoviesRepository.findByUserGroups(
      userId,
      query,
      limit,
      offset,
    );
  }

  /**
   * Gets a single custom movie by ID
   * @param id - Custom movie ID
   * @param groupId - Group ID for ownership check
   * @returns Custom movie
   * @throws NotFoundException if movie not found
   * @throws ForbiddenException if movie doesn't belong to group
   */
  async findOne(id: number, groupId: number): Promise<CustomMovie> {
    const movie = await this.customMoviesRepository.findById(id);

    if (!movie) {
      throw new NotFoundException(`Custom movie with id ${id} not found`);
    }

    if (movie.groupId !== groupId) {
      throw new ForbiddenException(
        `Custom movie ${id} does not belong to group ${groupId}`,
      );
    }

    return movie;
  }

  /**
   * Updates a custom movie
   * @param id - Custom movie ID
   * @param groupId - Group ID for ownership check
   * @param dto - Update data
   * @returns Updated custom movie
   */
  async update(
    id: number,
    groupId: number,
    dto: UpdateCustomMovieDto,
  ): Promise<CustomMovie> {
    await this.findOne(id, groupId);

    const updateData: Partial<Record<string, unknown>> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.posterPath !== undefined) updateData.posterPath = dto.posterPath;
    if (dto.overview !== undefined) updateData.overview = dto.overview;
    if (dto.releaseYear !== undefined) updateData.releaseYear = dto.releaseYear;
    if (dto.runtime !== undefined) updateData.runtime = dto.runtime;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.plannedDate !== undefined)
      updateData.plannedDate = dto.plannedDate
        ? new Date(dto.plannedDate)
        : null;
    if (dto.watchedDate !== undefined)
      updateData.watchedDate = dto.watchedDate
        ? new Date(dto.watchedDate)
        : null;

    const updatedMovie = await this.customMoviesRepository.update(
      id,
      updateData,
    );
    this._logger.log(
      `Custom movie ${id} updated, status: ${updatedMovie.status}`,
    );
    return updatedMovie;
  }

  /**
   * Deletes a custom movie
   * @param id - Custom movie ID
   * @param groupId - Group ID for ownership check
   */
  async remove(id: number, groupId: number): Promise<void> {
    await this.findOne(id, groupId);
    await this.customMoviesRepository.delete(id);
    this._logger.log(`Custom movie ${id} deleted`);
  }

  /**
   * Converts a group movie to custom movie
   * @param groupMovie - Group movie to convert
   * @param data - Optional override data for conversion
   * @returns Created custom movie
   */
  async convertFromGroupMovie(
    groupMovie: GroupMovie,
    data: ConvertGroupMovieData,
  ): Promise<CustomMovie> {
    const movie = await this.moviesRepository.findById(groupMovie.movieId);
    if (!movie) {
      throw new NotFoundException(`Movie ${groupMovie.movieId} not found`);
    }

    const customMovieData: CreateCustomMovieDto = {
      title: data.title ?? movie.title,
      posterPath: data.posterPath ?? movie.posterPath ?? undefined,
      overview: data.overview ?? movie.overview ?? undefined,
      releaseYear: data.releaseYear ?? movie.releaseYear ?? undefined,
      runtime: data.runtime ?? movie.runtime ?? undefined,
      status: data.status ?? groupMovie.status,
      plannedDate: data.plannedDate ?? groupMovie.plannedDate?.toISOString(),
      watchedDate: data.watchedDate ?? groupMovie.watchedDate?.toISOString(),
    };

    return this.create(groupMovie.groupId, groupMovie.addedBy, customMovieData);
  }
}
