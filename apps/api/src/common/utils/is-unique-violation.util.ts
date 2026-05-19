import { PG_UNIQUE_VIOLATION } from '$db/db.constants';

interface PostgresError extends Error {
  code?: string;
  cause?: { code?: string };
}

export const isUniqueViolation = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const pgError = error as PostgresError;
  const code = pgError.code ?? pgError.cause?.code;

  return code === PG_UNIQUE_VIOLATION;
};
