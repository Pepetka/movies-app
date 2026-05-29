import { HttpStatus } from '@nestjs/common';

import { HealthCheckError } from './errors';

export const ERROR_MAP = new Map<new (...args: any[]) => Error, number>([
  [HealthCheckError, HttpStatus.SERVICE_UNAVAILABLE],
]);
