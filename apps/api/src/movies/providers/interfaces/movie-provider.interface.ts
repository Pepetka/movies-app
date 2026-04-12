import type {
  ProviderSearchResult,
  ProviderMovieDetails,
} from './provider-result.dto';
import type { MovieSearchFilters } from './movie-search-filters';
import type { NewMovie } from '../../../db/schemas';

export interface MovieProvider {
  readonly name: string;

  search(
    query: string,
    page?: number,
    filters?: MovieSearchFilters,
  ): Promise<ProviderSearchResult>;

  getMovieDetails(externalId: string): Promise<ProviderMovieDetails>;

  findByImdbId(imdbId: string): Promise<ProviderMovieDetails>;

  mapToNewMovie(details: ProviderMovieDetails): NewMovie;
}
