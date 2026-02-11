export const THROTTLE = {
  csrf: {
    short: { limit: 10, ttl: 1000 },
    long: { limit: 50, ttl: 60000 },
  },
  auth: {
    critical: {
      short: { limit: 3, ttl: 1000 },
      long: { limit: 10, ttl: 60000 },
    },
    refresh: {
      short: { limit: 5, ttl: 1000 },
      long: { limit: 20, ttl: 60000 },
    },
  },
  movies: {
    search: {
      short: { limit: 5, ttl: 1000 },
      long: { limit: 50, ttl: 60000 },
    },
    admin: {
      short: { limit: 10, ttl: 1000 },
      long: { limit: 100, ttl: 60000 },
    },
  },
} as const;
