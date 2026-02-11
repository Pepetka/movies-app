import { ForbiddenException } from '@nestjs/common';

export class CannotRemoveOwnerException extends ForbiddenException {
  constructor() {
    super('Cannot remove the group owner');
  }
}
