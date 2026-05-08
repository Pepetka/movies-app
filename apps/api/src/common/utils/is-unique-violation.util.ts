import { PG_UNIQUE_VIOLATION } from '$db/db.constants';

export const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Error &&
  'code' in error &&
  (error as { code?: string }).code === PG_UNIQUE_VIOLATION;
