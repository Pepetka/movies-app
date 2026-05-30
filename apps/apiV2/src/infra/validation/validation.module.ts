import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { ValibotValidationPipe } from './valibot-validation.pipe';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValibotValidationPipe,
    },
  ],
})
export class ValidationModule {}
