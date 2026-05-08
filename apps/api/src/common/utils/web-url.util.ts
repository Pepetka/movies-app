/**
 * Extracts the primary (first) URL from a comma-separated list of URLs.
 * Trims whitespace and removes trailing slash.
 */
export const parsePrimaryWebUrl = (urls: string): string => {
  return urls.split(',')[0].trim().replace(/\/$/, '');
};
