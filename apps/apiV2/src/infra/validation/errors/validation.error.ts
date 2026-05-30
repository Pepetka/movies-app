import { BadRequestException } from '@nestjs/common';

export class ValidationError extends BadRequestException {
  constructor(
    public readonly details: {
      fieldErrors: Record<string, string[] | undefined>;
      formErrors: string[];
    },
  ) {
    super(details);
  }
}
