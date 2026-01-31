import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { validate } from '$common/configs/validation';

import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validate }),
    DbModule,
    HealthModule,
    UserModule,
  ],
})
export class AppModule {}
