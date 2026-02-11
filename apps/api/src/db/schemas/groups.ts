import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  index,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';
import { users } from './users';

export const groups = pgTable(
  'groups',
  {
    id: serial().primaryKey(),
    name: varchar({ length: 256 }).notNull(),
    description: text(),
    avatarUrl: varchar({ length: 512 }),
    ownerId: integer()
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    ...timestamps,
  },
  (table) => [index('owner_id_idx').on(table.ownerId)],
);
