import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { flatten, safeParse } from 'valibot';

import { SCHEMA_METADATA_KEY } from './validation.constants';
import { ValidationError } from './errors';

@Injectable()
export class ValibotValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const schema = metadata.metatype
      ? Reflect.getMetadata(SCHEMA_METADATA_KEY, metadata.metatype)
      : undefined;

    if (!schema) {
      return value;
    }

    const result = safeParse(schema, value);
    if (!result.success) {
      const flat = flatten(result.issues);
      throw new ValidationError({
        fieldErrors: flat.nested ?? {},
        formErrors: flat.root ?? [],
      });
    }

    return result.output;
  }
}
