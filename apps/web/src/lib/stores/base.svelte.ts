import { HttpError, NetworkError, RetryError } from '$lib/api/errors';
import { logger } from '$lib/utils/logger';

export class BaseStore {
	protected _log(
		level: 'debug' | 'info' | 'warn' | 'error',
		message: string,
		meta?: Record<string, unknown>
	): void {
		logger[level](this.constructor.name, message, meta);
	}

	protected _extractErrorMessage(error: unknown, fallback: string): string {
		if (
			error instanceof HttpError ||
			error instanceof NetworkError ||
			error instanceof RetryError
		) {
			return error.getErrorMessage();
		}
		if (error instanceof Error) {
			return error.message;
		}
		return fallback;
	}
}
