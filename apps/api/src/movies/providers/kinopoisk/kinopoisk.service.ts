import { Inject, Injectable, Logger } from '@nestjs/common';

import type {
  ProviderMovieDetails,
  ProviderSearchResult,
} from '../interfaces/provider-result.dto';
import {
  KINOPOISK_API_OPTIONS,
  type KinopoiskApiOptions,
} from './kinopoisk.constants';
import { MovieProvider } from '../interfaces/movie-provider.interface';
import { KinopoiskFilmDto, KinopoiskSearchResponseDto } from './dto';
import { KINOPOISK_DEFAULTS } from './kinopoisk-defaults.constants';
import { KinopoiskApiException } from './kinopoisk.exception';
import type { NewMovie } from '../../../db/schemas';

const REQUEST_TIMEOUT_MS = 15_000;

@Injectable()
export class KinopoiskService implements MovieProvider {
  readonly name = 'kinopoisk';
  private readonly _logger = new Logger(KinopoiskService.name);
  private readonly _options: KinopoiskApiOptions;

  constructor(@Inject(KINOPOISK_API_OPTIONS) options: KinopoiskApiOptions) {
    this._options = options;
  }

  private _createAbortController(): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return controller;
  }

  private _getHeaders(): Record<string, string> {
    return {
      'X-API-KEY': this._options.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async _searchMovies(
    query: string,
    page = KINOPOISK_DEFAULTS.PAGE,
    isImdb = false,
  ): Promise<KinopoiskSearchResponseDto> {
    const url = new URL(`${this._options.baseUrl}/films`);
    if (isImdb) {
      url.searchParams.set('imdbId', query);
    } else {
      url.searchParams.set('keyword', query);
    }
    url.searchParams.set('page', page.toString());
    url.searchParams.set('type', 'FILM');
    url.searchParams.set('order', 'YEAR');

    try {
      const response = await fetch(url.toString(), {
        headers: this._getHeaders(),
        signal: this._createAbortController().signal,
      });
      if (!response.ok) {
        throw new KinopoiskApiException(
          `Kinopoisk API error: ${response.status} ${response.statusText}`,
        );
      }
      return (await response.json()) as KinopoiskSearchResponseDto;
    } catch (error) {
      if (error instanceof KinopoiskApiException) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        this._logger.error(`Kinopoisk API request timed out`);
        throw new KinopoiskApiException(`Kinopoisk API request timed out`);
      }
      this._logger.error(`Failed to search movies: ${error}`);
      throw new KinopoiskApiException(`Failed to search movies`);
    }
  }

  /**
   * Searches for movies by keyword
   * @param query - Search query string
   * @param page - Page number (default: 1)
   * @returns Search results with movie previews
   */
  async search(
    query: string,
    page = KINOPOISK_DEFAULTS.PAGE,
  ): Promise<ProviderSearchResult> {
    const result = await this._searchMovies(query, page);
    return {
      page: page,
      totalPages: result.totalPages,
      totalResults: result.total,
      results: result.items.map((r) => ({
        imdbId: r.imdbId || null,
        externalId: r.kinopoiskId.toString(),
        title: this._getTitle(r),
        posterPath: r.posterUrlPreview ?? null,
        overview: '',
        releaseYear: r.year ?? null,
        rating: r.ratingImdb ?? 0,
      })),
    };
  }

  /**
   * Gets detailed movie information by external ID
   * @param externalId - Kinopoisk film ID
   * @returns Complete movie details
   * @throws KinopoiskApiException if movie not found or API error occurs
   */
  async getMovieDetails(externalId: string): Promise<ProviderMovieDetails> {
    const url = new URL(`${this._options.baseUrl}/films/${externalId}`);

    try {
      const response = await fetch(url.toString(), {
        headers: this._getHeaders(),
        signal: this._createAbortController().signal,
      });
      if (!response.ok) {
        throw new KinopoiskApiException(
          `Kinopoisk API error: ${response.status} ${response.statusText}`,
        );
      }
      const movie = (await response.json()) as KinopoiskFilmDto;
      return this._mapToProviderMovieDetails(movie);
    } catch (error) {
      if (error instanceof KinopoiskApiException) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        this._logger.error(`Kinopoisk API request timed out`);
        throw new KinopoiskApiException(`Kinopoisk API request timed out`);
      }
      this._logger.error(`Failed to get movie details: ${error}`);
      throw new KinopoiskApiException(`Failed to get movie details`);
    }
  }

  /**
   * Finds movie by IMDb ID
   * @param imdbId - IMDb ID (e.g., 'tt0111161')
   * @returns Complete movie details
   * @throws KinopoiskApiException if movie not found
   */
  async findByImdbId(imdbId: string): Promise<ProviderMovieDetails> {
    const result = await this._searchMovies(imdbId, 1, true);
    const movie = result.items.find((f) => f.imdbId === imdbId);

    if (!movie) {
      throw new KinopoiskApiException(`Movie not found by IMDb ID: ${imdbId}`);
    }

    return this.getMovieDetails(movie.kinopoiskId.toString());
  }

  /**
   * Maps provider movie details to database movie schema
   * @param details - Provider movie details
   * @returns New movie object for database insertion
   */
  mapToNewMovie(details: ProviderMovieDetails): NewMovie {
    return {
      externalId: details.externalId,
      imdbId: details.imdbId,
      title: details.title,
      posterPath: details.posterPath,
      overview: details.overview,
      releaseYear: details.releaseYear,
      rating: details.rating.toString(),
      genres: details.genres,
      runtime: details.runtime,
    };
  }

  private _mapToProviderMovieDetails(
    movie: KinopoiskFilmDto,
  ): ProviderMovieDetails {
    const genres = this._mapGenres(movie);

    return {
      imdbId: movie.imdbId,
      externalId: movie.kinopoiskId.toString(),
      title: this._getTitle(movie),
      posterPath: movie.posterUrl ?? null,
      overview: movie.description ?? movie.shortDescription ?? null,
      releaseYear: movie.year ?? null,
      rating: movie.ratingImdb ?? 0,
      genres,
      runtime: movie.filmLength ?? null,
    };
  }

  private _getTitle(movie: KinopoiskFilmDto): string {
    return movie.nameRu || movie.nameEn || movie.nameOriginal || '';
  }

  private _mapGenres(movie: KinopoiskFilmDto): string[] {
    if (!movie.genres) return [];
    return movie.genres.map((g) => g.genre);
  }

  /**
   * Returns poster URL (passthrough for Kinopoisk)
   * @param path - Poster URL or null
   * @returns Poster URL or null
   */
  getPosterUrl(path: string | null): string | null {
    if (!path) return null;
    return path;
  }
}
