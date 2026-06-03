import type { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { AppLoggerService } from '$src/infra/app-logger';
import { AppModule } from '$src/app.module';

export interface TestAppModuleOverride {
  apply(builder: TestingModuleBuilder): void;
}

interface CreateTestAppConfig {
  silentLogger?: boolean;
  overrides?: TestAppModuleOverride[];
}

export const createTestApp = async (config: CreateTestAppConfig = {}) => {
  const { overrides, silentLogger } = config;

  const builder = Test.createTestingModule({
    imports: [AppModule],
  });

  for (const o of overrides ?? []) {
    o.apply(builder);
  }

  if (silentLogger) {
    builder.overrideProvider(AppLoggerService).useValue({
      log: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
      verbose: () => {},
      fatal: () => {},
    });
  }

  const moduleRef: TestingModule = await builder.compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();

  await app.getHttpAdapter().getInstance().ready();

  return app;
};

export const withTestApp = async <T>(
  fn: (app: NestFastifyApplication) => Promise<T>,
  options?: CreateTestAppConfig,
) => {
  const app = await createTestApp(options);

  try {
    return await fn(app);
  } finally {
    await app.close();
  }
};
