import { ConflictException } from '@nestjs/common';

export class ReactionAlreadyExistsException extends ConflictException {
  constructor() {
    super('You have already reacted to this review');
  }
}
