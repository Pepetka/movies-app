import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  decimal,
  timestamp,
  unique,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';
import { groups } from './groups';
import { movies } from './movies';
import { users } from './users';

export const movieSourceEnum = pgEnum('movie_source', ['provider', 'custom']);

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
    source: movieSourceEnum('source').notNull().default('provider'),
    movieId: integer().references(() => movies.id, { onDelete: 'set null' }),
    title: varchar({ length: 255 }).notNull(),
    posterPath: varchar({ length: 512 }),
    overview: text(),
    releaseYear: integer(),
    runtime: integer(),
    rating: decimal({ precision: 3, scale: 1 }),
    status: groupMovieStatusEnum('status').notNull().default('tracking'),
    plannedDate: timestamp(),
    watchedDate: timestamp(),
    addedBy: integer()
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index('group_movies_group_id_idx').on(table.groupId),
    index('group_movies_group_status_idx').on(table.groupId, table.status),
    index('group_movies_movie_id_idx').on(table.movieId),
    unique().on(table.groupId, table.movieId),
  ],
);
