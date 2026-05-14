import { UnprocessableEntityException } from '@nestjs/common';

export class MovieNotWatchedException extends UnprocessableEntityException {
  constructor() {
    super('Reviews are only allowed for watched movies');
  }
}
