/* eslint-disable no-console */
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { hash } from 'bcrypt';

import { UserRole } from '$common/enums/user-role.enum';

import { users } from './schemas/users';

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'SecurePass123!';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const client = postgres(connectionString);
  const db = drizzle(client, { casing: 'snake_case' });

  const passwordHash = await hash(adminPassword, 12);

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log('Admin user already exists:', adminEmail);
    await client.end();
    return;
  }

  await db.insert(users).values({
    name: 'Admin',
    email: adminEmail,
    passwordHash,
    role: UserRole.ADMIN,
  });

  console.log('Admin user created successfully');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
