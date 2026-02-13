import {
  pgTable,
  serial,
  integer,
  unique,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';
import { groups } from './groups';
import { users } from './users';

export const groupMemberRoleEnum = pgEnum('group_member_role', [
  'admin',
  'moderator',
  'member',
]);

export const groupMembers = pgTable(
  'group_members',
  {
    id: serial().primaryKey(),
    groupId: integer()
      .references(() => groups.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: groupMemberRoleEnum('role').notNull().default('member'),
    ...timestamps,
  },
  (table) => [
    unique().on(table.groupId, table.userId),
    index('user_id_idx').on(table.userId),
    index('group_members_group_id_idx').on(table.groupId),
  ],
);
