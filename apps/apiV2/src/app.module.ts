import { Module } from '@nestjs/common';

import { ExceptionsModule } from '$infra/exceptions';
import { AppConfigModule } from '$infra/app-config';
import { HealthModule } from '$infra/health';

@Module({
  imports: [AppConfigModule, ExceptionsModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
