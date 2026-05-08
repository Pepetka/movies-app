import { pgEnum } from 'drizzle-orm/pg-core';

import { AuthProvider } from '$common/enums';

export const authProviderEnum = pgEnum('auth_provider', [
  AuthProvider.GOOGLE,
  // 'github', 'discord' — добавлять при расширении
]);
