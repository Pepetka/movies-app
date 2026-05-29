import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AppConfigModule } from '$infra/app-config';

import { HttpExceptionFilter } from './http-exception.filter';

@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class ExceptionsModule {}
