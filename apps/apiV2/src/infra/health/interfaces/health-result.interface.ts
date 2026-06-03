export interface HealthIndicatorResult {
  status: 'up' | 'down';
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthIndicator {
  readonly name: string;
  check(signal?: AbortSignal): Promise<HealthIndicatorResult>;
}
