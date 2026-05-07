import { Inject, Injectable } from '@nestjs/common';

import type { DrizzleDb, DrizzleTx } from './types/drizzle.types';
import { DRIZZLE } from './db.tokens';

@Injectable()
export class DbTransactionManager {
  constructor(@Inject(DRIZZLE) private readonly _db: DrizzleDb) {}

  async transaction<T>(callback: (tx: DrizzleTx) => Promise<T>): Promise<T> {
    return this._db.transaction(callback);
  }
}
