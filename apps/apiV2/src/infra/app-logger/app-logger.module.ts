import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppConfigService } from '$infra/app-config';

import { AppLoggerContextInterceptor } from './app-logger.interceptor';
import { AppLoggerService } from './app-logger.service';
import { createRootLogger } from './app-logger.config';
import { ROOT_LOGGER } from './app-logger.constants';

@Global()
@Module({
  providers: [
    {
      provide: ROOT_LOGGER,
      useFactory: (configService: AppConfigService) => {
        const logLevel = configService.get('LOG_LEVEL');
        return createRootLogger(configService.isDev, logLevel);
      },
      inject: [AppConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppLoggerContextInterceptor,
    },
    AppLoggerService,
  ],
  exports: [AppLoggerService, ROOT_LOGGER],
})
export class AppLoggerModule {}
