export type HealthStatus = 'loading' | 'online' | 'degraded' | 'offline';

export interface HealthCheckState {
	status: HealthStatus;
	lastChecked?: Date;
	latency?: number;
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
