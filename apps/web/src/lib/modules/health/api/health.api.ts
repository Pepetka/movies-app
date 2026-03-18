import { healthControllerHealthV1 } from '$lib/api/generated/api';
import { HttpError, NetworkError, RetryError } from '$lib/api';
import { logger } from '$lib/utils/logger';

import type { HealthCheckResult } from '../types';

export async function checkHealth(): Promise<HealthCheckResult> {
	const startTime = Date.now();

	try {
		const response = await healthControllerHealthV1();

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
		let errorMessage = 'Unknown error';

		if (error instanceof HttpError) {
			errorMessage = `HTTP ${error.status}: ${error.statusText}`;
		} else if (error instanceof NetworkError) {
			errorMessage = 'Network error';
		} else if (error instanceof RetryError) {
			errorMessage = `Request failed after ${error.attempts} attempts`;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

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
