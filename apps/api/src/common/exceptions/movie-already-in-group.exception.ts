import { ConflictException } from '@nestjs/common';

export class MovieAlreadyInGroupException extends ConflictException {
  constructor() {
    super('Movie already added to this group');
  }
}
