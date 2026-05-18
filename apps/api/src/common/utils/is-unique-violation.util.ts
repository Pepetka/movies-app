import { PG_UNIQUE_VIOLATION } from '$db/db.constants';

export const isUniqueViolation = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const code =
    ('code' in error && (error as { code?: string }).code) ||
    ('cause' in error && (error as { cause?: { code?: string } }).cause?.code);

  return code === PG_UNIQUE_VIOLATION;
};
