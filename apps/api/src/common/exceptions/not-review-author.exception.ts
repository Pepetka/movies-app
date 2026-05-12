import { ForbiddenException } from '@nestjs/common';

export class NotReviewAuthorException extends ForbiddenException {
  constructor() {
    super('You can only manage your own reviews');
  }
}
