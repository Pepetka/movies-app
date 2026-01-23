import {
  pgTable,
  serial,
  varchar,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';

export const movies = pgTable(
  'movies',
  {
    id: serial().primaryKey(),
    externalId: varchar({ length: 255 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('external_id_idx').on(table.externalId),
    index('title_idx').on(table.title),
  ],
);
