import { UnprocessableEntityException } from '@nestjs/common';

export class MovieNotWatchedException extends UnprocessableEntityException {
  constructor() {
    super('Reviews can only be created for watched movies');
  }
}
