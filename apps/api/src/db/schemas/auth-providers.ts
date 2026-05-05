import { pgEnum } from 'drizzle-orm/pg-core';

export const authProviderEnum = pgEnum('auth_provider', [
  'google',
  // 'github', 'discord' — добавлять при расширении
]);

export type AuthProvider = (typeof authProviderEnum.enumValues)[number];
