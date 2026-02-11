import { ForbiddenException } from '@nestjs/common';

export class NotGroupMemberException extends ForbiddenException {
  constructor() {
    super('You are not a member of this group');
  }
}
