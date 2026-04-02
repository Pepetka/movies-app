import { NotFoundException } from '@nestjs/common';

export class InviteNotFoundException extends NotFoundException {
  constructor() {
    super('Invite link not found or has been deactivated');
  }
}
