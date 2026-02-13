import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';

export const groups = pgTable('groups', {
  id: serial().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  description: text(),
  avatarUrl: varchar({ length: 512 }),
  ...timestamps,
});
