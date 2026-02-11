import {
  pgTable,
  serial,
  integer,
  timestamp,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';
import { groups } from './groups';
import { movies } from './movies';
import { users } from './users';

export const groupMovieStatusEnum = pgEnum('group_movie_status', [
  'tracking',
  'planned',
  'watched',
]);

export const groupMovies = pgTable(
  'group_movies',
  {
    id: serial().primaryKey(),
    groupId: integer()
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    movieId: integer()
      .references(() => movies.id, { onDelete: 'cascade' })
      .notNull(),
    addedBy: integer()
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    status: groupMovieStatusEnum('status').notNull().default('tracking'),
    plannedDate: timestamp(),
    watchedDate: timestamp(),
    ...timestamps,
  },
  (table) => [unique().on(table.groupId, table.movieId)],
);
