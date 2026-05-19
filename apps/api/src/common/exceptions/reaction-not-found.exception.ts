import { NotFoundException } from '@nestjs/common';

export class ReactionNotFoundException extends NotFoundException {
  constructor() {
    super('Reaction not found');
  }
}
