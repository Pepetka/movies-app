import { BadRequestException } from '@nestjs/common';

export class TargetNotGroupMemberException extends BadRequestException {
  constructor() {
    super('Target user is not a member of this group');
  }
}
