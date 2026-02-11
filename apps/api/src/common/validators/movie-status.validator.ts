import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

interface MovieStatusDto {
  status?: string;
  plannedDate?: string;
  watchedDate?: string;
}

@ValidatorConstraint({ name: 'isValidMovieStatus', async: false })
export class IsValidMovieStatusConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args?: ValidationArguments): boolean {
    const object = args?.object as MovieStatusDto | undefined;

    if (!object) {
      return true;
    }

    const { status, plannedDate, watchedDate } = object;

    if (!status) {
      return true;
    }

    if (status === 'planned' && !plannedDate) {
      return false;
    }

    if (status === 'watched' && !watchedDate) {
      return false;
    }

    if (status === 'tracking' && (plannedDate || watchedDate)) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'Invalid status and dates combination: planned requires plannedDate, watched requires watchedDate, tracking cannot have dates';
  }
}

export function IsValidMovieStatus(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidMovieStatusConstraint,
    });
  };
}
