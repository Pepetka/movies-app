import { ForbiddenException } from '@nestjs/common';

export class NotGroupAdminException extends ForbiddenException {
  constructor() {
    super('Requires group admin role');
  }
}
