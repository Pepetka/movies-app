import { ConflictException } from '@nestjs/common';

export class OnlyOneAdminException extends ConflictException {
  constructor() {
    super('Group can only have one admin');
  }
}
