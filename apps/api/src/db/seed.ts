/* eslint-disable no-console */
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { hash } from 'bcrypt';

import { UserRole } from '$common/enums/user-role.enum';

import { users } from './schemas/users';

const SEED_ADMIN_EMAIL = 'admin@movies.local';
const SEED_ADMIN_PASSWORD = 'SecurePass123!';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { casing: 'snake_case' });

  const passwordHash = await hash(SEED_ADMIN_PASSWORD, 12);

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, SEED_ADMIN_EMAIL))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log('Admin user already exists:', SEED_ADMIN_EMAIL);
    await client.end();
    return;
  }

  await db.insert(users).values({
    name: 'Admin',
    email: SEED_ADMIN_EMAIL,
    passwordHash,
    role: UserRole.ADMIN,
  });

  console.log('Admin user created successfully');
  console.log('Email:', SEED_ADMIN_EMAIL);
  console.log('Password:', SEED_ADMIN_PASSWORD);

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
