import type { HealthIndicatorResult } from './health-result.interface';

export interface HealthResult {
  status: 'ok' | 'error';
  info: Record<string, HealthIndicatorResult>;
  error: Record<string, HealthIndicatorResult>;
  details: Record<string, HealthIndicatorResult>;
}
