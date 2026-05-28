import { Injectable } from '@nestjs/common';

import { AppConfigService } from '$common/app-config';

import {
  HealthIndicator,
  HealthIndicatorResult,
} from '../interfaces/health-result.interface';

@Injectable()
export class MemoryHealthIndicator implements HealthIndicator {
  readonly name = 'memory';

  constructor(private readonly _configService: AppConfigService) {}

  async check(): Promise<HealthIndicatorResult> {
    const usage = process.memoryUsage();
    const thresholdMb = this._configService.get('HEALTH_MEMORY_THRESHOLD_MB');
    const threshold = thresholdMb * 1024 * 1024;
    const isHealthy = usage.heapUsed < threshold;

    return {
      status: isHealthy ? 'up' : 'down',
      details: {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        rss: usage.rss,
        thresholdMb,
      },
    };
  }
}
