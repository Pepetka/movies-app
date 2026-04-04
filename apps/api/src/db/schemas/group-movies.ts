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
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
    watchDate: timestamp(),
    addedBy: integer()
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index('group_movies_group_id_idx').on(table.groupId),
    index('group_movies_group_status_idx').on(table.groupId, table.status),
    index('group_movies_group_status_date_idx').on(
      table.groupId,
      table.status,
      table.watchDate,
    ),
    index('group_movies_movie_id_idx').on(table.movieId),
    unique().on(table.groupId, table.movieId),
    check(
      'source_movie_integrity',
      sql`((${table.source} = 'provider' AND ${table.movieId} IS NOT NULL) OR (${table.source} = 'custom' AND ${table.movieId} IS NULL))`,
    ),
    check(
      'planned_requires_watch_date',
      sql`(${table.status} != 'planned' OR ${table.watchDate} IS NOT NULL)`,
    ),
    check(
      'watched_requires_watch_date',
      sql`(${table.status} != 'watched' OR ${table.watchDate} IS NOT NULL)`,
    ),
    check(
      'tracking_forbids_watch_date',
      sql`(${table.status} != 'tracking' OR ${table.watchDate} IS NULL)`,
    ),
  ],
);
