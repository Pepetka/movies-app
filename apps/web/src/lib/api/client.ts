import {
	logRequestAttempt,
	logRequestSuccess,
	logRequestError,
	logRequestFailure
} from '$lib/utils/logger';
import type { FetchOptions } from '$lib/types/health';

const BASE_URL = import.meta.env.API_URL;

export async function apiFetch<T>(
	endpoint: string,
	options: RequestInit & FetchOptions = {}
): Promise<T> {
	const { timeout = 10000, retries = 3, retryDelay = 2000, ...fetchOptions } = options;

	for (let i = 0; i < retries; i++) {
		const attempt = i + 1;
		logRequestAttempt(endpoint, attempt, retries);

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const startTime = Date.now();
			const response = await fetch(`${BASE_URL}${endpoint}`, {
				...fetchOptions,
				signal: controller.signal
			});
			const latency = Date.now() - startTime;

			clearTimeout(timeoutId);

			if (!response.ok) {
				logRequestError(endpoint, response.status, attempt, latency);
				throw new Error(`HTTP ${response.status}`);
			}

			logRequestSuccess(endpoint, attempt, latency);
			return await response.json();
		} catch (error) {
			clearTimeout(timeoutId);
			logRequestFailure(endpoint, error, attempt, undefined);

			if (i === retries - 1) throw error;
			await new Promise((resolve) => setTimeout(resolve, retryDelay));
		}
	}

	throw new Error('Max retries exceeded');
}
