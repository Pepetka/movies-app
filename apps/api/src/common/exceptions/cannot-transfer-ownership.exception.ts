import { ConflictException } from '@nestjs/common';

export class CannotTransferOwnershipException extends ConflictException {
  constructor() {
    super('Group already has an admin');
  }
}
