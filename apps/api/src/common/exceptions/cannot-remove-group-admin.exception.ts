import { ForbiddenException } from '@nestjs/common';

export class CannotRemoveGroupAdminException extends ForbiddenException {
  constructor() {
    super('Cannot remove group admin');
  }
}
