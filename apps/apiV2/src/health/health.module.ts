import { Module } from '@nestjs/common';

import { LIVENESS_INDICATORS, READINESS_INDICATORS } from './health.constants';
import { HealthController } from './health.controller';
import { MemoryHealthIndicator } from './indicators';
import { HealthService } from './health.service';

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
