import z from 'zod';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const configSchema = z.object({
  NODE_ENV: z.enum(Environment),
  PORT: z.coerce.number().min(0).max(65535).default(8080),
  WEB_URL: z.string().transform((s) => s.split(',').map((u) => u.trim())),
  API_URL: z.url(),
  DATABASE_URL: z.string(),
  COOKIE_SECRET: z.string().min(32),
  HEALTH_MEMORY_THRESHOLD_MB: z.coerce.number().min(64).default(512),
  HEALTH_CHECK_TIMEOUT_MS: z.coerce.number().min(100).default(5000),
});

export type AppConfig = z.infer<typeof configSchema>;
