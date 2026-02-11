import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { MovieAlreadyExistsException } from '$common/exceptions';

import type { ProviderMovieDetails, ProviderSearchResult } from './providers';
import { MovieCreateDto, MovieUpdateDto, MovieSearchDto } from './dto';
import { MoviesRepository } from './movies.repository';
import { DEFAULT_PROVIDER } from './movies.constants';
import type { Movie, NewMovie } from '../db/schemas';
import { MovieProvidersService } from './providers';

export { MoviesRepository };

@Injectable()
export class MoviesService {
  private readonly _logger = new Logger(MoviesService.name);

  constructor(
    private readonly moviesRepository: MoviesRepository,
    private readonly movieProvidersService: MovieProvidersService,
  ) {}

  /**
   * Search for movies using external provider API
   * @param dto - Search query parameters including query string, page, language, and provider
   * @returns Paginated search results from the provider
   */
  async search(dto: MovieSearchDto): Promise<ProviderSearchResult> {
    const provider = this.movieProvidersService.getProvider(DEFAULT_PROVIDER);
    return provider.search(dto.query, dto.page);
  }

  /**
   * Create a new movie by fetching details from external provider
   * @param dto - Movie creation parameters (imdbId or externalId)
   * @returns Created movie record
   * @throws BadRequestException if neither imdbId nor externalId is provided
   * @throws MovieAlreadyExistsException if movie with same imdbId or externalId already exists
   */
  async create(dto: MovieCreateDto): Promise<Movie> {
    // Check if movie already exists by imdbId or externalId
    if (dto.imdbId) {
      const existingByImdb = await this.moviesRepository.findByImdbId(
        dto.imdbId,
      );
      if (existingByImdb) {
        throw new MovieAlreadyExistsException(dto.imdbId);
      }
    }

    if (dto.externalId) {
      const existingByExternal = await this.moviesRepository.findByExternalId(
        dto.externalId,
      );
      if (existingByExternal) {
        throw new MovieAlreadyExistsException(undefined, dto.externalId);
      }
    }

    const provider = this.movieProvidersService.getProvider(DEFAULT_PROVIDER);

    let details: ProviderMovieDetails;

    if (dto.imdbId) {
      details = await provider.findByImdbId(dto.imdbId);
    } else if (dto.externalId) {
      details = await provider.getMovieDetails(dto.externalId);
    } else {
      throw new BadRequestException(
        'Either imdbId or externalId must be provided',
      );
    }

    const newMovie = provider.mapToNewMovie(details);
    const movie = await this.moviesRepository.create(newMovie);

    this._logger.log(`Movie created with id: ${movie.id}`);
    return movie;
  }

  /**
   * Get all movies from database with pagination
   * @param limit - Maximum number of results to return
   * @param offset - Number of results to skip
   * @returns Array of movies
   */
  async findAll(limit = 100, offset = 0): Promise<Movie[]> {
    return this.moviesRepository.findAll(limit, offset);
  }

  /**
   * Get a single movie by ID
   * @param id - Movie ID
   * @returns Movie record
   * @throws NotFoundException if movie not found
   */
  async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  /**
   * Update an existing movie
   * @param id - Movie ID
   * @param dto - Update data
   * @returns Updated movie record
   * @throws NotFoundException if movie not found
   */
  async update(id: number, dto: MovieUpdateDto): Promise<Movie> {
    const movie = await this.moviesRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    const updateData: Partial<NewMovie> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.posterPath !== undefined) updateData.posterPath = dto.posterPath;
    if (dto.overview !== undefined) updateData.overview = dto.overview;
    if (dto.releaseYear !== undefined) updateData.releaseYear = dto.releaseYear;
    if (dto.rating !== undefined) updateData.rating = dto.rating.toString();
    if (dto.runtime !== undefined) updateData.runtime = dto.runtime;

    const updatedMovie = await this.moviesRepository.update(id, updateData);
    return updatedMovie;
  }

  /**
   * Delete a movie by ID
   * @param id - Movie ID
   * @throws NotFoundException if movie not found
   */
  async remove(id: number): Promise<void> {
    const movie = await this.moviesRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    await this.moviesRepository.delete(id);
    this._logger.log(`Movie deleted with id: ${id}`);
  }
}
