import { describe, expect, it } from 'vitest';

import { HealthCheckError } from '$infra/exceptions';
import { createTestModule } from '$test/utils';

import {
  baseProviders,
  EXPECT_ERROR_NUM,
  EXPECT_RESULT_NUM,
  expectError,
  expectResult,
  mockAbortableIndicator,
  mockDownIndicator,
  mockErrorIndicator,
  mockUpIndicator,
} from '../utils';
import { LIVENESS_INDICATORS, READINESS_INDICATORS } from './health.constants';
import { HealthService } from './health.service';

describe('HealthService', () => {
  describe('checkLiveness', () => {
    it('returns ok when all liveness indicators are up', async () => {
      expect.assertions(EXPECT_RESULT_NUM);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(LIVENESS_INDICATORS)
                .useValue([mockUpIndicator('a'), mockUpIndicator('b')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const result = await service.checkLiveness();

      expectResult(result, {
        a: { status: 'up' },
        b: { status: 'up' },
      });
    });

    it('throws HealthCheckError when at least one liveness indicator is down', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(LIVENESS_INDICATORS)
                .useValue([mockDownIndicator('a')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkLiveness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, { a: { status: 'down' } });
        return true;
      });
    });

    it('returns ok when no liveness indicators are registered', async () => {
      expect.assertions(EXPECT_RESULT_NUM);
      const moduleRef = await createTestModule({
        providers: baseProviders,
      });

      const service = moduleRef.get(HealthService);
      const result = await service.checkLiveness();

      expectResult(result);
    });

    it('aggregates info, error, and details for multiple mixed liveness indicators', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(LIVENESS_INDICATORS)
                .useValue([
                  mockUpIndicator('a'),
                  mockUpIndicator('b'),
                  mockDownIndicator('c'),
                ]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkLiveness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, {
          a: { status: 'up' },
          b: { status: 'up' },
          c: { status: 'down' },
        });
        return true;
      });
    });

    it('returns down status with error message when liveness indicator throws', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(LIVENESS_INDICATORS)
                .useValue([mockErrorIndicator('a')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkLiveness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, {
          a: { status: 'down', message: 'Indicator failure' },
        });
        return true;
      });
    });

    it('returns down with "Timeout" message when liveness indicator exceeds timeout', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(LIVENESS_INDICATORS)
                .useValue([mockAbortableIndicator('a')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkLiveness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, {
          a: { status: 'down', message: 'Timeout' },
        });
        return true;
      });
    });

    it('passes AbortSignal to liveness indicators', async () => {
      expect.assertions(3);
      let capturedSignal: AbortSignal | undefined;
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(LIVENESS_INDICATORS)
                .useValue([
                  mockAbortableIndicator(
                    'a',
                    (signal) => (capturedSignal = signal),
                  ),
                ]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkLiveness();

      await expect(resultPromise).rejects.toBeInstanceOf(HealthCheckError);
      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(true);
    });
  });

  describe('checkReadiness', () => {
    it('returns ok when all readiness indicators are up', async () => {
      expect.assertions(EXPECT_RESULT_NUM);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(READINESS_INDICATORS)
                .useValue([mockUpIndicator('a'), mockUpIndicator('b')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const result = await service.checkReadiness();

      expectResult(result, {
        a: { status: 'up' },
        b: { status: 'up' },
      });
    });

    it('throws HealthCheckError when at least one readiness indicator is down', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(READINESS_INDICATORS)
                .useValue([mockDownIndicator('a')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkReadiness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, { a: { status: 'down' } });
        return true;
      });
    });

    it('returns ok when no readiness indicators are registered', async () => {
      expect.assertions(EXPECT_RESULT_NUM);
      const moduleRef = await createTestModule({
        providers: baseProviders,
      });

      const service = moduleRef.get(HealthService);
      const result = await service.checkReadiness();

      expectResult(result);
    });

    it('aggregates info, error, and details for multiple mixed readiness indicators', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(READINESS_INDICATORS)
                .useValue([
                  mockUpIndicator('a'),
                  mockUpIndicator('b'),
                  mockDownIndicator('c'),
                ]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkReadiness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, {
          a: { status: 'up' },
          b: { status: 'up' },
          c: { status: 'down' },
        });
        return true;
      });
    });

    it('returns down status with error message when readiness indicator throws', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(READINESS_INDICATORS)
                .useValue([mockErrorIndicator('a')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkReadiness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, {
          a: { status: 'down', message: 'Indicator failure' },
        });
        return true;
      });
    });

    it('returns down with "Timeout" message when readiness indicator exceeds timeout', async () => {
      expect.assertions(EXPECT_ERROR_NUM + 1);
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(READINESS_INDICATORS)
                .useValue([mockAbortableIndicator('a')]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkReadiness();

      await expect(resultPromise).rejects.toSatisfy((err: unknown) => {
        expectError(err, {
          a: { status: 'down', message: 'Timeout' },
        });
        return true;
      });
    });

    it('passes AbortSignal to readiness indicators', async () => {
      expect.assertions(3);
      let capturedSignal: AbortSignal | undefined;
      const moduleRef = await createTestModule({
        providers: baseProviders,
        overrides: [
          {
            apply: (b) =>
              b
                .overrideProvider(READINESS_INDICATORS)
                .useValue([
                  mockAbortableIndicator(
                    'a',
                    (signal) => (capturedSignal = signal),
                  ),
                ]),
          },
        ],
      });

      const service = moduleRef.get(HealthService);
      const resultPromise = service.checkReadiness();

      await expect(resultPromise).rejects.toBeInstanceOf(HealthCheckError);
      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(true);
    });
  });
});
