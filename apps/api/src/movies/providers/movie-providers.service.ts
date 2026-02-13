import { Injectable, BadRequestException } from '@nestjs/common';

import type { MovieProvider } from './interfaces/movie-provider.interface';
import { KinopoiskService } from './kinopoisk/kinopoisk.service';
import { MOVIE_PROVIDERS } from '../movies.constants';

@Injectable()
export class MovieProvidersService {
  private readonly providers = new Map<string, MovieProvider>();

  constructor(private readonly kinopoiskService: KinopoiskService) {
    this.providers.set(MOVIE_PROVIDERS.KINOPOISK, kinopoiskService);
  }

  /**
   * Gets a movie provider by name
   * @param name - Provider name (e.g., 'kinopoisk')
   * @returns Movie provider instance
   * @throws BadRequestException if provider not found
   */
  getProvider(name: string): MovieProvider {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new BadRequestException(
        `Provider "${name}" is not supported. Supported providers: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }

    return provider;
  }
}
