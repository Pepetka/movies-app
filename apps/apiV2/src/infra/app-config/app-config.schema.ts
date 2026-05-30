import * as v from 'valibot';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const configSchema = v.object({
  NODE_ENV: v.enum(Environment),
  PORT: v.fallback(
    v.pipe(v.string(), v.toNumber(), v.minValue(0), v.maxValue(65535)),
    8080,
  ),
  WEB_URL: v.pipe(
    v.string(),
    v.transform((s) =>
      s
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean),
    ),
    v.array(v.pipe(v.string(), v.url())),
    v.minLength(1),
  ),
  API_URL: v.pipe(v.string(), v.url()),
  DATABASE_URL: v.pipe(v.string(), v.minLength(1)),
  COOKIE_SECRET: v.pipe(v.string(), v.minLength(32)),
  HEALTH_MEMORY_THRESHOLD_MB: v.fallback(
    v.pipe(v.string(), v.toNumber(), v.minValue(64)),
    512,
  ),
  HEALTH_CHECK_TIMEOUT_MS: v.fallback(
    v.pipe(v.string(), v.toNumber(), v.minValue(100)),
    5000,
  ),
});

export type AppConfig = v.InferOutput<typeof configSchema>;
