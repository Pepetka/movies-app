import type { HealthResult } from '$infra/health';

export class HealthCheckError extends Error {
  constructor(readonly result: HealthResult) {
    super('Health check failed');
    this.name = 'HealthCheckError';
  }
}
