import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneOf', async: false })
export class AtLeastOneOfConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const [properties] = args.constraints;
    const object = args.object as Record<string, unknown>;

    return properties.some((property: string) => {
      const value = object[property];
      return value !== undefined && value !== null && value !== '';
    });
  }

  defaultMessage(args: ValidationArguments) {
    const [properties] = args.constraints;
    return `At least one of ${properties.join(', ')} must be provided`;
  }
}

export function AtLeastOneOf(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [properties],
      validator: AtLeastOneOfConstraint,
    });
  };
}
