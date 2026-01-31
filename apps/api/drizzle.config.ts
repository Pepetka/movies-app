import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  schema: './src/db/schemas',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: dbUrl,
  },
});
