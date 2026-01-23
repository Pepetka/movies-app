import { pgTable, serial, varchar, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey(),
    name: varchar({ length: 256 }).notNull(),
    email: varchar({ length: 256 }).notNull(),
    passwordHash: varchar({ length: 256 }).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('email_idx').on(table.email)],
);
