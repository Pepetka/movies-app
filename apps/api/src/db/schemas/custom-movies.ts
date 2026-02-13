import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';
import { groups } from './groups';
import { users } from './users';

export const customMovieStatusEnum = pgEnum('custom_movie_status', [
  'tracking',
  'planned',
  'watched',
]);

export const customMovies = pgTable(
  'custom_movies',
  {
    id: serial().primaryKey(),
    groupId: integer()
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    posterPath: varchar({ length: 512 }),
    overview: text(),
    releaseYear: integer(),
    runtime: integer(),
    status: customMovieStatusEnum('status').notNull().default('tracking'),
    plannedDate: timestamp(),
    watchedDate: timestamp(),
    createdById: integer()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index('group_id_idx').on(table.groupId),
    index('custom_movies_title_idx').on(table.title),
    index('custom_movies_status_idx').on(table.status),
  ],
);
