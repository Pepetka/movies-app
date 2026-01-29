export const healthConfig = {
	// Polling
	defaultPollingInterval: 60000,
	maxPollingInterval: 300000,
	maxConsecutiveFailures: 10,

	// API
	timeout: 10000,
	retries: 3,
	retryDelay: 2000,

	// Backoff
	backoffMultiplier: 2,
	maxBackoffInterval: 300000,

	// Logging
	logLevel: (import.meta.env.MODE === 'production' ? 'warn' : 'info') as
		| 'debug'
		| 'info'
		| 'warn'
		| 'error'
} as const;

export type HealthConfig = typeof healthConfig;
