import {
  pgTable,
  serial,
  integer,
  varchar,
  unique,
  index,
} from 'drizzle-orm/pg-core';

import { groupMovieReviews } from './group-movie-reviews';
import { timestamps } from './timestamps';
import { users } from './users';

export const groupMovieReviewReactions = pgTable(
  'group_movie_review_reactions',
  {
    id: serial().primaryKey(),
    reviewId: integer()
      .references(() => groupMovieReviews.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    emoji: varchar({ length: 20 }).notNull(),
    ...timestamps,
  },
  (table) => [
    unique('group_movie_review_reactions_unique_idx').on(
      table.reviewId,
      table.userId,
    ),
    index('group_movie_review_reactions_review_id_idx').on(table.reviewId),
    index('group_movie_review_reactions_user_id_idx').on(table.userId),
  ],
);
