export const MOVIE_STATUSES = ['tracking', 'planned', 'watched'] as const;

export type MovieStatus = (typeof MOVIE_STATUSES)[number];

export const MovieStatusEnum = MOVIE_STATUSES;
