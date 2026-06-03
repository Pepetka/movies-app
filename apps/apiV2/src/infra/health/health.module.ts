import { Module } from '@nestjs/common';

import {
  LIVENESS_INDICATORS,
  READINESS_INDICATORS,
} from './core/health.constants';
import { HealthController } from './core/health.controller';
import { HealthService } from './core/health.service';
import { MemoryHealthIndicator } from './indicators';

@Module({
  controllers: [HealthController],
  providers: [
    HealthService,
    MemoryHealthIndicator,
    {
      provide: LIVENESS_INDICATORS,
      useFactory: (memory: MemoryHealthIndicator) => [memory],
      inject: [MemoryHealthIndicator],
    },
    {
      provide: READINESS_INDICATORS,
      useFactory: (memory: MemoryHealthIndicator) => [memory],
      inject: [MemoryHealthIndicator],
    },
  ],
})
export class HealthModule {}
