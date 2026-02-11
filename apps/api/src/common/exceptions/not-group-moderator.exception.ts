import { ForbiddenException } from '@nestjs/common';

export class NotGroupModeratorException extends ForbiddenException {
  constructor() {
    super('Requires group admin or moderator role');
  }
}
