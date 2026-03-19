/**
 * Escapes special characters in a string for use in LIKE/ILIKE patterns
 * PostgreSQL LIKE uses % (any chars), _ (single char), and \ (escape char)
 */
export function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}
