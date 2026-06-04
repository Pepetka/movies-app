import { describe, expect, it } from 'vitest';

import { createTestModule } from '$test/utils';

import {
  EXPECT_MEMORY_DETAILS_NUM,
  expectMemory,
  mockAppConfigService,
  mockMemoryUsage,
} from '../utils';
import { MemoryHealthIndicator } from './memory.health.indicator';

describe('MemoryHealthIndicator', () => {
  describe('check', () => {
    it('returns up when heapUsed is below threshold', async () => {
      expect.assertions(EXPECT_MEMORY_DETAILS_NUM);
      const HEALTH_MEMORY_THRESHOLD_MB = 100;
      const { mock, spy } = mockMemoryUsage(50);

      const moduleRef = await createTestModule({
        providers: [
          MemoryHealthIndicator,
          mockAppConfigService({ HEALTH_MEMORY_THRESHOLD_MB }),
        ],
      });

      const indicator = moduleRef.get(MemoryHealthIndicator);
      const result = await indicator.check();

      expectMemory(result, {
        status: 'up',
        thresholdMb: HEALTH_MEMORY_THRESHOLD_MB,
        heapUsed: mock.heapUsed,
      });

      spy.mockRestore();
    });

    it('returns down when heapUsed exceeds threshold', async () => {
      expect.assertions(EXPECT_MEMORY_DETAILS_NUM);
      const HEALTH_MEMORY_THRESHOLD_MB = 10;
      const { mock, spy } = mockMemoryUsage(50);

      const moduleRef = await createTestModule({
        providers: [
          MemoryHealthIndicator,
          mockAppConfigService({ HEALTH_MEMORY_THRESHOLD_MB }),
        ],
      });

      const indicator = moduleRef.get(MemoryHealthIndicator);
      const result = await indicator.check();

      expectMemory(result, {
        status: 'down',
        thresholdMb: HEALTH_MEMORY_THRESHOLD_MB,
        heapUsed: mock.heapUsed,
      });

      spy.mockRestore();
    });

    it('returns down when heapUsed equals threshold', async () => {
      expect.assertions(EXPECT_MEMORY_DETAILS_NUM);
      const HEALTH_MEMORY_THRESHOLD_MB = 50;
      const { mock, spy } = mockMemoryUsage(50);

      const moduleRef = await createTestModule({
        providers: [
          MemoryHealthIndicator,
          mockAppConfigService({ HEALTH_MEMORY_THRESHOLD_MB }),
        ],
      });

      const indicator = moduleRef.get(MemoryHealthIndicator);
      const result = await indicator.check();

      expectMemory(result, {
        status: 'down',
        thresholdMb: HEALTH_MEMORY_THRESHOLD_MB,
        heapUsed: mock.heapUsed,
      });

      spy.mockRestore();
    });
  });
});
