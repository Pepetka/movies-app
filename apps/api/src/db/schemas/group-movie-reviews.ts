import {
  pgTable,
  serial,
  integer,
  text,
  decimal,
  unique,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { groupMovies } from './group-movies';
import { timestamps } from './timestamps';
import { users } from './users';

export const groupMovieReviews = pgTable(
  'group_movie_reviews',
  {
    id: serial().primaryKey(),
    groupMovieId: integer()
      .references(() => groupMovies.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    rating: decimal({ precision: 2, scale: 1 }).notNull(),
    text: text(),
    ...timestamps,
  },
  (table) => [
    unique('group_movie_reviews_unique_idx').on(
      table.groupMovieId,
      table.userId,
    ),
    index('group_movie_reviews_group_movie_id_idx').on(table.groupMovieId),
    index('group_movie_reviews_user_id_idx').on(table.userId),
    check(
      'valid_review_rating_range',
      sql`${table.rating} >= 0.5 AND ${table.rating} <= 5.0`,
    ),
  ],
);
