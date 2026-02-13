import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { MovieAlreadyInGroupException } from '$common/exceptions';

import { GroupMoviesRepository } from './group-movies.repository';
import { MoviesRepository } from '../movies/movies.repository';
import { DEFAULT_PROVIDER } from '../movies/movies.constants';
import { MovieProvidersService } from '../movies/providers';
import { AddMovieDto, GroupMovieUpdateDto } from './dto';
import type { MovieProvider } from '../movies/providers';
import { GroupMovie, Movie } from '../db/schemas';

@Injectable()
export class GroupMoviesService {
  private readonly _logger = new Logger(GroupMoviesService.name);

  constructor(
    private readonly groupMoviesRepository: GroupMoviesRepository,
    private readonly moviesRepository: MoviesRepository,
    private readonly movieProvidersService: MovieProvidersService,
  ) {}

  /**
   * Adds an existing movie to a group
   * @param groupId - Group ID
   * @param movieId - Movie ID from database
   * @param addedBy - User ID who is adding the movie
   * @returns Created group movie record
   * @throws NotFoundException if movie not found
   * @throws MovieAlreadyInGroupException if movie already in group
   */
  async addMovie(
    groupId: number,
    movieId: number,
    addedBy: number,
  ): Promise<GroupMovie> {
    const movie = await this.moviesRepository.findById(movieId);
    if (!movie) {
      throw new NotFoundException(`Movie with id ${movieId} not found`);
    }

    const exists = await this.groupMoviesRepository.exists(groupId, movieId);

    if (exists) {
      throw new MovieAlreadyInGroupException();
    }

    const newGroupMovie = {
      groupId,
      movieId,
      addedBy,
      status: 'tracking' as const,
    };

    const groupMovie = await this.groupMoviesRepository.create(newGroupMovie);
    this._logger.log(
      `Movie ${movieId} added to group ${groupId} with status: tracking`,
    );
    return groupMovie;
  }

  /**
   * Adds movie to group by DTO (finds or creates movie first)
   * @param groupId - Group ID
   * @param dto - Movie addition data with imdbId or externalId
   * @param addedBy - User ID who is adding the movie
   * @returns Created group movie record
   */
  async addMovieByDto(
    groupId: number,
    dto: AddMovieDto,
    addedBy: number,
  ): Promise<GroupMovie> {
    const movie = await this.findOrCreateMovie(dto);
    return this.addMovie(groupId, movie.id, addedBy);
  }

  /**
   * Finds movie in database or imports from provider
   * @param dto - Movie identifier (imdbId or externalId)
   * @returns Movie from database or newly imported
   */
  async findOrCreateMovie(dto: AddMovieDto): Promise<Movie> {
    const provider = this.movieProvidersService.getProvider(DEFAULT_PROVIDER);

    let movie: Movie | null = null;

    if (dto.imdbId) {
      movie = await this.moviesRepository.findByImdbId(dto.imdbId);
    } else if (dto.externalId) {
      movie = await this.moviesRepository.findByExternalId(dto.externalId);
    }

    if (movie) {
      this._logger.log(`Movie already exists locally: ${movie.id}`);
      return movie;
    }

    return this.importMovie(dto, provider);
  }

  private async importMovie(
    dto: AddMovieDto,
    provider: MovieProvider,
  ): Promise<Movie> {
    const details = dto.imdbId
      ? await provider.findByImdbId(dto.imdbId)
      : await provider.getMovieDetails(dto.externalId ?? '');

    const newMovie = provider.mapToNewMovie(details);
    const movie = await this.moviesRepository.create(newMovie);

    this._logger.log(`Movie imported from provider with id: ${movie.id}`);
    return movie;
  }

  /**
   * Gets all movies for a group
   * @param groupId - Group ID
   * @returns Array of group movies
   */
  async findByGroup(groupId: number): Promise<GroupMovie[]> {
    return this.groupMoviesRepository.findByGroup(groupId);
  }

  /**
   * Gets a single movie from group
   * @param groupId - Group ID
   * @param movieId - Movie ID
   * @returns Group movie record
   * @throws NotFoundException if movie not in group
   */
  async findOne(groupId: number, movieId: number): Promise<GroupMovie> {
    const groupMovie = await this.groupMoviesRepository.findOne(
      groupId,
      movieId,
    );

    if (!groupMovie) {
      throw new NotFoundException(
        `Movie ${movieId} not found in group ${groupId}`,
      );
    }

    return groupMovie;
  }

  /**
   * Updates movie status in group
   * @param groupId - Group ID
   * @param movieId - Movie ID
   * @param dto - Update data (status, plannedDate, watchedDate)
   * @returns Updated group movie record
   */
  async update(
    groupId: number,
    movieId: number,
    dto: GroupMovieUpdateDto,
  ): Promise<GroupMovie> {
    await this.findOne(groupId, movieId);

    const updateData: Partial<Record<string, unknown>> = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.plannedDate !== undefined)
      updateData.plannedDate = dto.plannedDate
        ? new Date(dto.plannedDate)
        : null;
    if (dto.watchedDate !== undefined)
      updateData.watchedDate = dto.watchedDate
        ? new Date(dto.watchedDate)
        : null;

    const updated = await this.groupMoviesRepository.update(
      groupId,
      movieId,
      updateData,
    );

    this._logger.log(
      `Movie ${movieId} in group ${groupId} updated with status: ${dto.status}`,
    );
    return updated;
  }

  /**
   * Removes movie from group
   * @param groupId - Group ID
   * @param movieId - Movie ID
   */
  async remove(groupId: number, movieId: number): Promise<void> {
    await this.findOne(groupId, movieId);

    await this.groupMoviesRepository.delete(groupId, movieId);

    const references = await this.groupMoviesRepository.countByMovie(movieId);

    if (references === 0) {
      this._logger.log(
        `Movie ${movieId} is no longer referenced in any groups (keeping in DB for potential reuse)`,
      );
    }

    this._logger.log(`Movie ${movieId} removed from group ${groupId}`);
  }
}
