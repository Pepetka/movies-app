import { Module } from '@nestjs/common';

import { ExceptionsModule } from '$infra/exceptions';
import { ValidationModule } from '$infra/validation';
import { AppConfigModule } from '$infra/app-config';
import { HealthModule } from '$infra/health';

@Module({
  imports: [AppConfigModule, ExceptionsModule, ValidationModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
