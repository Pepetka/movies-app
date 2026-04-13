import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { MovieAlreadyInGroupException } from '$common/exceptions';
import { MoviesService } from '$src/movies/movies.service';
import { GroupMovie, NewGroupMovie } from '$db/schemas';
import { GroupMemberRole } from '$common/enums';

import {
  AddMovieDto,
  CreateCustomMovieDto,
  GroupMovieUpdateDto,
  FindAllGroupMoviesDto,
  MovieSearchGroupDto,
} from './dto';
import { ProviderSearchResult } from '$src/movies/providers/interfaces/provider-result.dto';
import { GroupMoviesRepository } from './group-movies.repository';

@Injectable()
export class GroupMoviesService {
  private readonly _logger = new Logger(GroupMoviesService.name);

  constructor(
    private readonly groupMoviesRepository: GroupMoviesRepository,
    private readonly moviesService: MoviesService,
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

  async findOrCreateMovie(
    dto: AddMovieDto,
  ): ReturnType<MoviesService['findOrCreateMovie']> {
    return this.moviesService.findOrCreateMovie(dto.imdbId, dto.externalId);
  }

  async findByGroup(
    groupId: number,
    options?: FindAllGroupMoviesDto,
  ): Promise<GroupMovie[]> {
    return this.groupMoviesRepository.findByGroup(
      groupId,
      options && {
        status: options.status,
        query: options.query,
      },
    );
  }

  async searchInGroup(
    groupId: number,
    dto: MovieSearchGroupDto,
  ): Promise<{ provider: ProviderSearchResult; currentGroup: GroupMovie[] }> {
    const [providerResults, groupMovies] = await Promise.all([
      this.moviesService.search(dto),
      this.groupMoviesRepository.findByGroup(groupId, { query: dto.query }),
    ]);

    return {
      provider: providerResults,
      currentGroup: groupMovies,
    };
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
