import { NotFoundException } from '@nestjs/common';

export class GroupNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Group with id ${id} not found`);
  }
}
