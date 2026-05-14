import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

interface UpdateReviewDto {
  rating?: number;
  text?: string;
}

@ValidatorConstraint({ name: 'validateUpdateReview', async: false })
export class ValidateUpdateReviewConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const object = args.object as UpdateReviewDto;
    return object.rating !== undefined || object.text !== undefined;
  }

  defaultMessage(): string {
    return 'At least one of rating or text must be provided';
  }
}

export function ValidateUpdateReview(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidateUpdateReviewConstraint,
    });
  };
}
