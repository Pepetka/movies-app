import { Inject, Injectable } from '@nestjs/common';

import {
  DatabaseStatus,
  HealthResponseDto,
  HealthStatus,
} from './dto/health-response.dto';
import { DrizzleDb } from '../db/types/drizzle.types';
import { DRIZZLE } from '../db/db.module';

@Injectable()
export class HealthService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async health(): Promise<HealthResponseDto> {
    const timestamp = Date.now();

    try {
      await this.db.execute('SELECT 1');

      return {
        status: HealthStatus.OK,
        timestamp,
        database: DatabaseStatus.CONNECTED,
      };
    } catch (error) {
      return {
        status: HealthStatus.DEGRADED,
        timestamp,
        database: DatabaseStatus.DISCONNECTED,
        error:
          error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }
}
