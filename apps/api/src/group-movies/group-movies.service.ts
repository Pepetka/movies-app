import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { MovieAlreadyInGroupException } from '$common/exceptions';
import { MoviesRepository } from '$src/movies/movies.repository';
import { DEFAULT_PROVIDER } from '$src/movies/movies.constants';
import { GroupMovie, Movie, NewGroupMovie } from '$db/schemas';
import { MovieProvidersService } from '$src/movies/providers';
import type { MovieProvider } from '$src/movies/providers';
import { GroupMemberRole } from '$common/enums';

import { AddMovieDto, CreateCustomMovieDto, GroupMovieUpdateDto } from './dto';
import { GroupMoviesRepository } from './group-movies.repository';

@Injectable()
export class GroupMoviesService {
  private readonly _logger = new Logger(GroupMoviesService.name);

  constructor(
    private readonly groupMoviesRepository: GroupMoviesRepository,
    private readonly moviesRepository: MoviesRepository,
    private readonly movieProvidersService: MovieProvidersService,
  ) {}

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
      watchDate: dto.watchDate ? new Date(dto.watchDate) : null,
    });

    this._logger.log(
      `Custom movie created in group ${groupId} with id: ${groupMovie.id}`,
    );
    return groupMovie;
  }

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

  async findByGroup(
    groupId: number,
    status?: string,
    query?: string,
  ): Promise<GroupMovie[]> {
    return this.groupMoviesRepository.findByGroup(groupId, status, query);
  }

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

  async findById(groupId: number, id: number): Promise<GroupMovie> {
    return this._findOneOrThrow(groupId, id);
  }

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

  async update(
    groupId: number,
    id: number,
    dto: GroupMovieUpdateDto,
  ): Promise<GroupMovie> {
    await this._findOneOrThrow(groupId, id);

    const updateData: Partial<NewGroupMovie> = {};

    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.watchDate !== undefined)
      updateData.watchDate = dto.watchDate ? new Date(dto.watchDate) : null;

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

  async remove(groupId: number, id: number): Promise<void> {
    await this._findOneOrThrow(groupId, id);
    await this.groupMoviesRepository.delete(groupId, id);

    this._logger.log(`Movie ${id} removed from group ${groupId}`);
  }
}
