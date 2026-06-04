import { describe, expect, it } from 'vitest';

import { HealthCheckError } from '$infra/exceptions';
import { createTestModule } from '$test/utils';

import {
  EXPECT_ERROR_NUM,
  EXPECT_RESULT_NUM,
  expectError,
  expectResult,
  mockResult,
} from '../utils';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthResultDto } from '../dto';

describe('HealthController', () => {
  describe('check', () => {
    it('returns HealthResultDto when liveness check succeeds', async () => {
      expect.assertions(EXPECT_RESULT_NUM + 1);
      const moduleRef = await createTestModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthService,
            useValue: {
              checkLiveness: async () => mockResult({ a: { status: 'up' } }),
            } as Partial<HealthService>,
          },
        ],
      });

      const controller = moduleRef.get(HealthController);
      const result = await controller.check();

      expect(result).toBeInstanceOf(HealthResultDto);
      expectResult(result, {
        a: { status: 'up' },
      });
    });

    it('propagates HealthCheckError when liveness check fails', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthService,
            useValue: {
              checkLiveness: async () => {
                throw new HealthCheckError(
                  mockResult({ a: { status: 'down' } }),
                );
              },
            } as Partial<HealthService>,
          },
        ],
      });

      const controller = moduleRef.get(HealthController);
      const resultPromise = controller.check();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, { a: { status: 'down' } });
        return true;
      });
    });
  });

  describe('checkReady', () => {
    it('returns HealthResultDto when readiness check succeeds', async () => {
      expect.assertions(EXPECT_RESULT_NUM + 1);
      const moduleRef = await createTestModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthService,
            useValue: {
              checkReadiness: async () => mockResult({ a: { status: 'up' } }),
            } as Partial<HealthService>,
          },
        ],
      });

      const controller = moduleRef.get(HealthController);
      const result = await controller.checkReady();

      expect(result).toBeInstanceOf(HealthResultDto);
      expectResult(result, {
        a: { status: 'up' },
      });
    });

    it('propagates HealthCheckError when readiness check fails', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthService,
            useValue: {
              checkReadiness: async () => {
                throw new HealthCheckError(
                  mockResult({ a: { status: 'down' } }),
                );
              },
            } as Partial<HealthService>,
          },
        ],
      });

      const controller = moduleRef.get(HealthController);
      const resultPromise = controller.checkReady();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, { a: { status: 'down' } });
        return true;
      });
    });
  });
});
