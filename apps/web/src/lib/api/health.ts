import type { HealthCheckResponse, HealthCheckResult } from '$lib/types/health';
import { logger } from '$lib/utils/logger';

import { apiFetch } from './client';

export async function checkHealth(): Promise<HealthCheckResult> {
	const startTime = Date.now();

	try {
		const response = await apiFetch<HealthCheckResponse>('/v1/health', {
			timeout: 10000,
			retries: 3
		});

		const latency = Date.now() - startTime;

		if (response.status === 'ok') {
			if (response.database !== 'connected') {
				throw new Error('Invalid health response: successful status requires connected database');
			}

			return {
				type: 'success',
				healthy: true,
				degraded: false,
				latency,
				timestamp: new Date(),
				database: response.database
			};
		} else if (response.status === 'degraded') {
			if (response.database !== 'disconnected') {
				throw new Error('Invalid health response: degraded status requires disconnected database');
			}

			return {
				type: 'degraded',
				healthy: false,
				degraded: true,
				latency,
				timestamp: new Date(),
				database: response.database,
				error: response.error || 'Service degraded'
			};
		}

		throw new Error('Invalid health response');
	} catch (error) {
		const latency = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		logger.error('HealthCheck', `Health check failed: ${errorMessage}`, { error });

		return {
			type: 'error',
			healthy: false,
			degraded: false,
			latency,
			timestamp: new Date(),
			database: 'disconnected',
			error: errorMessage
		};
	}
}
