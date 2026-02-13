import { ConflictException } from '@nestjs/common';

export class UserAlreadyMemberException extends ConflictException {
  constructor() {
    super('User is already a member of this group');
  }
}
