import {
  pgTable,
  serial,
  varchar,
  text,
  decimal,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';

export const movies = pgTable(
  'movies',
  {
    id: serial().primaryKey(),
    externalId: varchar({ length: 255 }).notNull(),
    imdbId: varchar({ length: 20 }),
    title: varchar({ length: 255 }).notNull(),
    posterPath: varchar({ length: 512 }),
    overview: text(),
    releaseYear: integer(),
    rating: decimal({ precision: 3, scale: 1 }),
    genres: jsonb(),
    runtime: integer(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('external_id_idx').on(table.externalId),
    index('imdb_id_idx').on(table.imdbId),
    index('title_idx').on(table.title),
  ],
);
