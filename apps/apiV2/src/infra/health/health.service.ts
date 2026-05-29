import { Inject, Injectable } from '@nestjs/common';

import { AppConfigService } from '$infra/app-config';
import { HealthCheckError } from '$infra/exceptions';

import {
  HealthIndicator,
  HealthIndicatorResult,
} from './interfaces/health-result.interface';
import { LIVENESS_INDICATORS, READINESS_INDICATORS } from './health.constants';
import { HealthResult } from './interfaces/health-indicator.interface';

@Injectable()
export class HealthService {
  constructor(
    @Inject(LIVENESS_INDICATORS)
    private readonly _liveness: HealthIndicator[],
    @Inject(READINESS_INDICATORS)
    private readonly _readiness: HealthIndicator[],
    private readonly _configService: AppConfigService,
  ) {}

  async checkLiveness(): Promise<HealthResult> {
    const result = await this._check(this._liveness);
    return this._checkStatus(result);
  }

  async checkReadiness(): Promise<HealthResult> {
    const result = await this._check(this._readiness);
    return this._checkStatus(result);
  }

  private _checkStatus(result: HealthResult): HealthResult {
    if (result.status === 'error') throw new HealthCheckError(result);
    return result;
  }

  private async _check(indicators: HealthIndicator[]): Promise<HealthResult> {
    const timeoutMs = this._configService.get('HEALTH_CHECK_TIMEOUT_MS');

    const results = await Promise.allSettled<HealthIndicatorResult>(
      indicators.map(async (indicator) => {
        const check = indicator.check();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs),
        );

        try {
          const result = await Promise.race([check, timeout]);
          return result as HealthIndicatorResult;
        } catch (e: unknown) {
          return {
            status: 'down',
            message: e instanceof Error ? e.message : 'Unknown error',
          };
        }
      }),
    );

    const info: Record<string, HealthIndicatorResult> = {};
    const error: Record<string, HealthIndicatorResult> = {};
    const details: Record<string, HealthIndicatorResult> = {};

    indicators.forEach((indicator, i) => {
      const result: HealthIndicatorResult =
        results[i].status === 'fulfilled'
          ? results[i].value
          : {
              status: 'down' as const,
              message: String(results[i].reason),
            };

      details[indicator.name] = result;
      if (result.status === 'up') {
        info[indicator.name] = result;
      } else {
        error[indicator.name] = result;
      }
    });

    const isHealthy = !Object.keys(error).length;

    return {
      status: isHealthy ? 'ok' : 'error',
      info,
      error,
      details,
    };
  }
}
