export type HealthStatus = 'loading' | 'online' | 'degraded' | 'offline';

export interface HealthCheckState {
	status: HealthStatus;
	lastChecked?: Date;
	latency?: number;
	error?: string;
}

export interface HealthCheckResponse {
	status: 'ok' | 'degraded';
	timestamp: number;
	database: 'connected' | 'disconnected';
	error?: string;
}

export type HealthCheckResult =
	| {
			type: 'success';
			healthy: true;
			degraded: false;
			latency: number;
			timestamp: Date;
			database: 'connected';
			error?: never;
	  }
	| {
			type: 'degraded';
			healthy: false;
			degraded: true;
			latency: number;
			timestamp: Date;
			database: 'disconnected';
			error: string;
	  }
	| {
			type: 'error';
			healthy: false;
			degraded: false;
			latency: number;
			timestamp: Date;
			database: 'disconnected';
			error: string;
	  };

export interface FetchOptions {
	timeout?: number;
	retries?: number;
	retryDelay?: number;
	signal?: AbortSignal;
}
