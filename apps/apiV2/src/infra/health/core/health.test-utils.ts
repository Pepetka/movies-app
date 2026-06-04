import type { Provider, Type } from '@nestjs/common';
import { expect } from 'vitest';

import { AppConfigService } from '$infra/app-config';
import { HealthCheckError } from '$infra/exceptions';

import type {
  HealthIndicator,
  HealthIndicatorResult,
} from '../interfaces/health-result.interface';
import { LIVENESS_INDICATORS, READINESS_INDICATORS } from './health.constants';
import type { HealthResult } from '../interfaces/health-indicator.interface';
import { HealthService } from './health.service';

export const baseProviders: Array<Type<unknown> | Provider> = [
  HealthService,
  {
    provide: AppConfigService,
    useValue: {
      get: (key: string) => {
        if (key === 'HEALTH_CHECK_TIMEOUT_MS') return 1;
        throw new Error(`Unexpected config key in test: ${key}`);
      },
    },
  },
  {
    provide: LIVENESS_INDICATORS,
    useValue: [],
  },
  {
    provide: READINESS_INDICATORS,
    useValue: [],
  },
];

export const mockUpIndicator = (name: string): HealthIndicator => ({
  name,
  check: async () => ({ status: 'up' }),
});

export const mockDownIndicator = (name: string): HealthIndicator => ({
  name,
  check: async () => ({ status: 'down' }),
});

export const mockErrorIndicator = (name: string): HealthIndicator => ({
  name,
  check: async () => {
    throw new Error('Indicator failure');
  },
});

export const mockAbortableIndicator = (
  name: string,
  onAbort?: (signal?: AbortSignal) => void,
): HealthIndicator => ({
  name,
  check: async (signal?: AbortSignal) => {
    onAbort?.(signal);
    return new Promise((_resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('Aborted'));
        return;
      }
      signal?.addEventListener('abort', () => reject(new Error('Aborted')));
    });
  },
});

type IndicatorResult = Record<string, HealthIndicatorResult>;

export const EXPECT_RESULT_NUM = 4;
export const EXPECT_ERROR_NUM = EXPECT_RESULT_NUM + 1;

const getUpDownIndicatorsResults = (indicatorsResult: IndicatorResult) => {
  return Object.entries(indicatorsResult).reduce<{
    upResult: IndicatorResult;
    downResult: IndicatorResult;
  }>(
    (acc, [name, result]) => {
      if (result.status === 'up') {
        acc.upResult[name] = result;
      }
      if (result.status === 'down') {
        acc.downResult[name] = result;
      }
      return acc;
    },
    {
      upResult: {},
      downResult: {},
    },
  );
};

export const mockResult = (indicatorsResult: IndicatorResult): HealthResult => {
  const { upResult, downResult } = getUpDownIndicatorsResults(indicatorsResult);
  const status = Object.keys(downResult).length ? 'error' : 'ok';

  return {
    status,
    info: upResult,
    error: downResult,
    details: indicatorsResult,
  };
};

export const expectResult = (
  result: HealthResult,
  expecting: IndicatorResult = {},
  status: 'ok' | 'error' = 'ok',
) => {
  const { upResult: upExpecting, downResult: downExpecting } =
    getUpDownIndicatorsResults(expecting);

  expect(result.status).toBe(status);
  expect(result.info).toEqual(upExpecting);
  expect(result.error).toEqual(downExpecting);
  expect(result.details).toEqual(expecting);
};

export const expectError = (
  err: unknown,
  expecting: Record<string, HealthIndicatorResult> = {},
) => {
  expect(err).toBeInstanceOf(HealthCheckError);
  const typedErr = err as HealthCheckError;

  expectResult(typedErr.result, expecting, 'error');
};
