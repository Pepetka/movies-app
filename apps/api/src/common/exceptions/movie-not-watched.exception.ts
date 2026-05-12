import { ConflictException } from '@nestjs/common';

export class MovieNotWatchedException extends ConflictException {
  constructor() {
    super('Reviews can only be created for watched movies');
  }
}
