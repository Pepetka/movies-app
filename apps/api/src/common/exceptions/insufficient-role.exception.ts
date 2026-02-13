import { ForbiddenException } from '@nestjs/common';

export class InsufficientRoleException extends ForbiddenException {
  constructor(requiredRole: string) {
    super(`Requires role: ${requiredRole}`);
  }
}
