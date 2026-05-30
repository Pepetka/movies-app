import 'reflect-metadata';

import type { GenericSchema } from 'valibot';

import { SCHEMA_METADATA_KEY } from './validation.constants';

export function Schema<T extends GenericSchema>(schema: T): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target);
  };
}
