import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { MovieAlreadyExistsException } from '$common/exceptions';

import { MovieSearchOrder } from './providers/interfaces/movie-search-filters';
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
    const { query, page: pageParam, ...filters } = dto;
    const page = pageParam ?? 1;
    const order = filters.order ?? MovieSearchOrder.YEAR;
    const provider = this.movieProvidersService.getProvider(DEFAULT_PROVIDER);
    return provider.search(query, page, { ...filters, order });
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

  /**
   * Find a movie by IMDb ID
   * @param imdbId - IMDb ID (e.g., 'tt0111161')
   * @returns Movie record or null if not found
   */
  async findByImdbId(imdbId: string): Promise<Movie | null> {
    return this.moviesRepository.findByImdbId(imdbId);
  }

  /**
   * Find a movie by external provider ID
   * @param externalId - External provider ID
   * @returns Movie record or null if not found
   */
  async findByExternalId(externalId: string): Promise<Movie | null> {
    return this.moviesRepository.findByExternalId(externalId);
  }

  /**
   * Create a movie from provider details
   * @param details - Provider movie details
   * @returns Created movie record
   */
  async createFromProvider(details: ProviderMovieDetails): Promise<Movie> {
    const newMovie = this.movieProvidersService
      .getProvider(DEFAULT_PROVIDER)
      .mapToNewMovie(details);
    const movie = await this.moviesRepository.create(newMovie);
    this._logger.log(`Movie imported from provider with id: ${movie.id}`);
    return movie;
  }

  /**
   * Find existing movie by imdbId or externalId, or create from provider if not found.
   * This method prevents race conditions by double-checking before creation.
   * @param imdbId - Optional IMDb ID
   * @param externalId - Optional external provider ID
   * @returns Found or created movie
   * @throws BadRequestException if neither id is provided
   */
  async findOrCreateMovie(
    imdbId: string | undefined,
    externalId: string | undefined,
  ): Promise<Movie> {
    if (!imdbId && !externalId) {
      throw new BadRequestException(
        'Either imdbId or externalId must be provided',
      );
    }

    // First check: find existing movie
    let movie: Movie | null = null;
    if (imdbId) {
      movie = await this.moviesRepository.findByImdbId(imdbId);
    }
    if (!movie && externalId) {
      movie = await this.moviesRepository.findByExternalId(externalId);
    }

    if (movie) {
      this._logger.log(`Movie found locally: ${movie.id}`);
      return movie;
    }

    // Fetch from provider
    const provider = this.movieProvidersService.getProvider(DEFAULT_PROVIDER);
    const details = imdbId
      ? await provider.findByImdbId(imdbId)
      : await provider.getMovieDetails(externalId!);

    // Second check before creation (prevent race condition)
    if (imdbId) {
      movie = await this.moviesRepository.findByImdbId(imdbId);
    }
    if (!movie && externalId) {
      movie = await this.moviesRepository.findByExternalId(externalId);
    }

    if (movie) {
      this._logger.log(`Movie found locally after provider fetch: ${movie.id}`);
      return movie;
    }

    // Create new movie
    return this.createFromProvider(details);
  }
}
