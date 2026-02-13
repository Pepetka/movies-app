import { ForbiddenException } from '@nestjs/common';

export class CannotLeaveGroupException extends ForbiddenException {
  constructor() {
    super('Cannot leave group - admin must transfer ownership first');
  }
}
