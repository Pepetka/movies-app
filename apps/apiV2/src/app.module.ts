import { Module } from '@nestjs/common';

import { ExceptionsModule } from '$infra/exceptions';
import { ValidationModule } from '$infra/validation';
import { AppConfigModule } from '$infra/app-config';
import { AppLoggerModule } from '$infra/app-logger';
import { HealthModule } from '$infra/health';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    ExceptionsModule,
    ValidationModule,
    HealthModule,
  ],
})
export class AppModule {}
