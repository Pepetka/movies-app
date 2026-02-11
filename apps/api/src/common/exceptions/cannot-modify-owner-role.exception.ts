import { ForbiddenException } from '@nestjs/common';

export class CannotModifyOwnerRoleException extends ForbiddenException {
  constructor() {
    super('Cannot modify the role of the group owner');
  }
}
