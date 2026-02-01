import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AuthGuard, AuthorGuard, RolesGuard, CsrfGuard } from '$common/guards';
import { validate } from '$common/configs/validation';
import { Environment } from '$common/configs';

import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CsrfModule } from './csrf/csrf.module';
import { DbModule } from './db/db.module';

const isTest = process.env.NODE_ENV === Environment.Test;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    DbModule,
    HealthModule,
    UserModule,
    AuthModule,
    CsrfModule,
  ],
  providers: [
    ...(isTest
      ? []
      : [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
          {
            provide: APP_GUARD,
            useClass: CsrfGuard,
          },
        ]),
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorGuard,
    },
  ],
})
export class AppModule {}
