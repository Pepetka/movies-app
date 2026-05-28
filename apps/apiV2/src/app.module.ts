import { Module } from '@nestjs/common';

import { AppConfigModule } from '$common/app-config';
import { HealthModule } from '$src/health';

@Module({
  imports: [AppConfigModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
