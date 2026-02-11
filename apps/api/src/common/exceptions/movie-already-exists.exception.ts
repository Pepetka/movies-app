import { HttpException, HttpStatus } from '@nestjs/common';

export class MovieAlreadyExistsException extends HttpException {
  constructor(imdbId?: string, externalId?: string) {
    const identifiers = [
      imdbId ? `IMDb ID: ${imdbId}` : null,
      externalId ? `external ID: ${externalId}` : null,
    ]
      .filter(Boolean)
      .join(' or ');

    super(`Movie with ${identifiers} already exists`, HttpStatus.CONFLICT);
  }
}
