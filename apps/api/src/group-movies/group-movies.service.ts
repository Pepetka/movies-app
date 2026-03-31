import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { MovieAlreadyInGroupException } from '$common/exceptions';
import { GroupMemberRole } from '$common/enums';

import { AddMovieDto, CreateCustomMovieDto, GroupMovieUpdateDto } from './dto';
import { GroupMoviesRepository } from './group-movies.repository';
import { GroupMovie, Movie, NewGroupMovie } from '../db/schemas';
import { GroupsRepository } from '../groups/groups.repository';
import { MoviesRepository } from '../movies/movies.repository';
import { DEFAULT_PROVIDER } from '../movies/movies.constants';
import { MovieProvidersService } from '../movies/providers';
import type { MovieProvider } from '../movies/providers';

@Injectable()
export class GroupMoviesService {
  private readonly _logger = new Logger(GroupMoviesService.name);

  constructor(
    private readonly groupMoviesRepository: GroupMoviesRepository,
    private readonly moviesRepository: MoviesRepository,
    private readonly movieProvidersService: MovieProvidersService,
    private readonly groupsRepository: GroupsRepository,
  ) {}

  /**
   * Adds a provider movie to a group (creates copy in group_movies)
   * @param groupId - Group ID
   * @param dto - Movie identification data (imdbId or externalId)
   * @param addedBy - User ID who adds the movie
   * @returns Created group movie
   * @throws MovieAlreadyInGroupException if movie already in group
   */
  async addProviderMovie(
    groupId: number,
    dto: AddMovieDto,
    addedBy: number,
  ): Promise<GroupMovie> {
    const movie = await this.findOrCreateMovie(dto);

    const exists = await this.groupMoviesRepository.exists(groupId, movie.id);
    if (exists) {
      throw new MovieAlreadyInGroupException();
    }

    const groupMovie = await this.groupMoviesRepository.create({
      groupId,
      source: 'provider',
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      overview: movie.overview,
      releaseYear: movie.releaseYear,
      runtime: movie.runtime,
      rating: movie.rating,
      addedBy,
      status: 'tracking',
    });

    this._logger.log(
      `Provider movie ${movie.id} added to group ${groupId} with status: tracking`,
    );
    return groupMovie;
  }

  /**
   * Creates a custom movie in a group
   * @param groupId - Group ID
   * @param dto - Custom movie creation data
   * @param createdById - User ID who creates the movie
   * @returns Created group movie
   */
  async createCustomMovie(
    groupId: number,
    dto: CreateCustomMovieDto,
    createdById: number,
  ): Promise<GroupMovie> {
    const groupMovie = await this.groupMoviesRepository.create({
      groupId,
      source: 'custom',
      movieId: null,
      title: dto.title,
      posterPath: dto.posterPath ?? null,
      overview: dto.overview ?? null,
      releaseYear: dto.releaseYear ?? null,
      runtime: dto.runtime ?? null,
      rating: null,
      addedBy: createdById,
      status: dto.status ?? 'tracking',
      plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : null,
      watchedDate: dto.watchedDate ? new Date(dto.watchedDate) : null,
    });

    this._logger.log(
      `Custom movie created in group ${groupId} with id: ${groupMovie.id}`,
    );
    return groupMovie;
  }

  /**
   * Finds movie in database or imports from provider
   * @param dto - Movie identification data (imdbId or externalId)
   * @returns Found or created movie
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

  /**
   * Imports movie from provider
   * @param dto - Movie identification data
   * @param provider - Movie provider instance
   * @returns Imported movie
   */
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
   * Gets all movies for a group (unified list)
   * @param groupId - Group ID
   * @param status - Optional status filter
   * @param query - Optional search query
   * @returns Array of group movies
   */
  async findByGroup(
    groupId: number,
    status?: string,
    query?: string,
  ): Promise<GroupMovie[]> {
    return this.groupMoviesRepository.findByGroup(groupId, status, query);
  }

  /**
   * Gets a single movie from group with current user's role
   * @param groupId - Group ID
   * @param id - Group movie ID
   * @param currentUserRole - Current user's role in the group
   * @returns Group movie with current user role
   * @throws NotFoundException if movie not found
   */
  async findOne(
    groupId: number,
    id: number,
    currentUserRole: GroupMemberRole,
  ): Promise<GroupMovie & { currentUserRole: GroupMemberRole }> {
    const groupMovie = await this._findOneOrThrow(groupId, id);

    return {
      ...groupMovie,
      currentUserRole,
    };
  }

  /**
   * Gets a single movie from group (for internal use)
   * @param groupId - Group ID
   * @param id - Group movie ID
   * @returns Group movie
   * @throws NotFoundException if movie not found
   */
  async findById(groupId: number, id: number): Promise<GroupMovie> {
    return this._findOneOrThrow(groupId, id);
  }

  /**
   * Finds group movie or throws NotFoundException
   * @param groupId - Group ID
   * @param id - Group movie ID
   * @returns Group movie
   * @throws NotFoundException if movie not found
   */
  private async _findOneOrThrow(
    groupId: number,
    id: number,
  ): Promise<GroupMovie> {
    const groupMovie = await this.groupMoviesRepository.findOne(groupId, id);

    if (!groupMovie) {
      throw new NotFoundException(`Movie ${id} not found in group ${groupId}`);
    }

    return groupMovie;
  }

  /**
   * Updates movie in group (status and/or data)
   * @param groupId - Group ID
   * @param id - Group movie ID
   * @param dto - Update data
   * @returns Updated group movie
   * @throws NotFoundException if movie not found
   */
  async update(
    groupId: number,
    id: number,
    dto: GroupMovieUpdateDto,
  ): Promise<GroupMovie> {
    await this._findOneOrThrow(groupId, id);

    const updateData: Partial<NewGroupMovie> = {};

    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.plannedDate !== undefined)
      updateData.plannedDate = dto.plannedDate
        ? new Date(dto.plannedDate)
        : null;
    if (dto.watchedDate !== undefined)
      updateData.watchedDate = dto.watchedDate
        ? new Date(dto.watchedDate)
        : null;

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.posterPath !== undefined) updateData.posterPath = dto.posterPath;
    if (dto.overview !== undefined) updateData.overview = dto.overview;
    if (dto.releaseYear !== undefined) updateData.releaseYear = dto.releaseYear;
    if (dto.runtime !== undefined) updateData.runtime = dto.runtime;

    const updated = await this.groupMoviesRepository.update(
      groupId,
      id,
      updateData,
    );

    this._logger.log(`Movie ${id} in group ${groupId} updated`);
    return updated;
  }

  /**
   * Removes movie from group
   * @param groupId - Group ID
   * @param id - Group movie ID
   * @throws NotFoundException if movie not found
   */
  async remove(groupId: number, id: number): Promise<void> {
    await this._findOneOrThrow(groupId, id);
    await this.groupMoviesRepository.delete(groupId, id);

    this._logger.log(`Movie ${id} removed from group ${groupId}`);
  }
}
