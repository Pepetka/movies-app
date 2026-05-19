import { ForbiddenException } from '@nestjs/common';

export class CannotReactToOwnReviewException extends ForbiddenException {
  constructor() {
    super('You cannot react to your own review');
  }
}
