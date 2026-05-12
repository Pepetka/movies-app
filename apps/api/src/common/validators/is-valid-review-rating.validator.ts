import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidReviewRating', async: false })
export class IsValidReviewRatingConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return false;
    }

    if (value < 0.5 || value > 5.0) {
      return false;
    }

    // Step 0.5 validation: multiply by 10, must be divisible by 5
    const scaled = Math.round(value * 10);
    return scaled % 5 === 0;
  }

  defaultMessage(): string {
    return 'Rating must be between 0.5 and 5.0 with a step of 0.5';
  }
}

export function IsValidReviewRating(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidReviewRatingConstraint,
    });
  };
}
