import {
  pgTable,
  serial,
  integer,
  varchar,
  unique,
  index,
} from 'drizzle-orm/pg-core';

import { authProviderEnum } from './auth-providers';
import { timestamps } from './timestamps';
import { users } from './users';

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: serial().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: authProviderEnum('provider').notNull(),
    providerAccountId: varchar({ length: 256 }).notNull(),
    avatar: varchar({ length: 512 }),
    ...timestamps,
  },
  (table) => [
    unique('oauth_accounts_provider_account_unique').on(
      table.provider,
      table.providerAccountId,
    ),
    index('oauth_accounts_user_id_idx').on(table.userId),
  ],
);
