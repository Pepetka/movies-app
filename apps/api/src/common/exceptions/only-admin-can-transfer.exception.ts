import { ForbiddenException } from '@nestjs/common';

export class OnlyAdminCanTransferException extends ForbiddenException {
  constructor() {
    super('Only group admin can transfer ownership');
  }
}
