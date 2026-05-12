import { ConflictException } from '@nestjs/common';

export class ReviewAlreadyExistsException extends ConflictException {
  constructor() {
    super('You have already reviewed this movie');
  }
}
