import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { GroupMovieStatus } from '$common/enums';

interface MovieStatusDto {
  status?: GroupMovieStatus;
  watchDate?: string;
}

@ValidatorConstraint({ name: 'isValidMovieStatus', async: false })
export class IsValidMovieStatusConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args?: ValidationArguments): boolean {
    const object = args?.object as MovieStatusDto | undefined;

    if (!object) {
      return true;
    }

    const { status, watchDate } = object;

    if (
      (status === GroupMovieStatus.PLANNED ||
        status === GroupMovieStatus.WATCHED) &&
      !watchDate
    ) {
      return false;
    }

    if (status === GroupMovieStatus.TRACKING && watchDate) {
      return false;
    }

    if (!status && watchDate) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'Invalid status/date combination: planned and watched require watchDate, tracking cannot have a date';
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
