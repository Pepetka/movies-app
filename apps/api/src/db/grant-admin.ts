/* eslint-disable no-console */
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

import { UserRole } from '$common/enums/user-role.enum';

import { users } from './schemas/users';

async function grantAdmin() {
  const connectionString = process.env.DATABASE_URL;
  const targetEmail = process.env.ADMIN_EMAIL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!targetEmail) {
    throw new Error('ADMIN_EMAIL is not set');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { casing: 'snake_case' });

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, targetEmail))
    .limit(1);

  if (existingUser.length === 0) {
    console.error('User not found:', targetEmail);
    await client.end();
    process.exit(1);
    return;
  }

  if (existingUser[0].role === UserRole.ADMIN) {
    console.log('User already has admin role:', targetEmail);
    await client.end();
    return;
  }

  await db
    .update(users)
    .set({ role: UserRole.ADMIN })
    .where(eq(users.email, targetEmail));

  console.log('Admin role granted successfully to:', targetEmail);

  await client.end();
}

grantAdmin().catch((err) => {
  console.error('Grant admin failed:', err);
  process.exit(1);
});
