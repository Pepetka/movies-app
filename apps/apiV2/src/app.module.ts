import { Module } from '@nestjs/common';

import { AppConfigModule } from '$infra/app-config';
import { HealthModule } from '$infra/health';

@Module({
  imports: [AppConfigModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
