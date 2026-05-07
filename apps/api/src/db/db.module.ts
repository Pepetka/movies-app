import { drizzle } from 'drizzle-orm/postgres-js';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';

import { DbTransactionManager } from './transaction.manager';
import { DRIZZLE } from './db.tokens';
import * as schema from './schemas';

export { DRIZZLE };

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = postgres(config.getOrThrow<string>('DATABASE_URL'));
        return drizzle(client, { schema, casing: 'snake_case' });
      },
    },
    DbTransactionManager,
  ],
  exports: [DRIZZLE, DbTransactionManager],
})
export class DbModule {}
