import { ConflictException } from '@nestjs/common';

export class CannotSetAdminRoleException extends ConflictException {
  constructor() {
    super('Use transfer ownership to change admin role');
  }
}
