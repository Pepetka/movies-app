import type {
  ProviderSearchResult,
  ProviderMovieDetails,
} from './provider-result.dto';
import type { NewMovie } from '../../../db/schemas';

export interface MovieProvider {
  readonly name: string;

  search(query: string, page?: number): Promise<ProviderSearchResult>;

  getMovieDetails(externalId: string): Promise<ProviderMovieDetails>;

  findByImdbId(imdbId: string): Promise<ProviderMovieDetails>;

  mapToNewMovie(details: ProviderMovieDetails): NewMovie;
}
