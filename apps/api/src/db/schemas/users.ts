import {
  pgTable,
  serial,
  varchar,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { UserRole } from '$common/enums/user-role.enum';

import { timestamps } from './timestamps';

export const userRoleEnum = pgEnum('user_role', [
  UserRole.USER,
  UserRole.ADMIN,
]);

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey(),
    name: varchar({ length: 256 }).notNull(),
    email: varchar({ length: 256 }).notNull(),
    passwordHash: varchar({ length: 256 }).notNull(),
    role: userRoleEnum('role').notNull().default(UserRole.USER),
    refreshTokenHash: varchar({ length: 256 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('email_idx').on(table.email),
    uniqueIndex('refresh_token_hash_idx').on(table.refreshTokenHash),
  ],
);
