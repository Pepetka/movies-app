export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LOG_LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

function getCurrentLogLevel(): LogLevel {
	if (typeof window === 'undefined') return 'error';

	const envLevel = import.meta.env.VITE_LOG_LEVEL;
	if (envLevel && Object.keys(LOG_LEVELS).includes(envLevel)) {
		return envLevel as LogLevel;
	}

	return __IS_PROD__ ? 'warn' : 'info';
}

function shouldLog(level: LogLevel): boolean {
	const currentLevel = getCurrentLogLevel();
	return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function log(
	level: LogLevel,
	context: string,
	message: string,
	meta?: Record<string, unknown>
): void {
	if (!shouldLog(level) || typeof window === 'undefined') return;

	const timestamp = new Date().toISOString();
	const formattedMessage = `[${context}:${timestamp}] ${message}`;

	if (meta) {
		// eslint-disable-next-line no-console
		console[level](formattedMessage, meta);
	} else {
		// eslint-disable-next-line no-console
		console[level](formattedMessage);
	}
}

export function logRequestAttempt(endpoint: string, attempt: number, totalRetries: number): void {
	log('debug', 'API', `Attempt ${attempt}/${totalRetries}: ${endpoint}`);
}

export function logRequestSuccess(endpoint: string, attempt: number, latency: number): void {
	log('info', 'API', `Success: ${endpoint} (attempt ${attempt}, ${latency}ms)`);
}

export function logRequestError(
	endpoint: string,
	status: number,
	attempt: number,
	latency: number
): void {
	log('warn', 'API', `Error ${status}: ${endpoint} (attempt ${attempt}, ${latency}ms)`);
}

export function logRequestFailure(
	endpoint: string,
	error: unknown,
	attempt: number,
	latency?: number
): void {
	const errorMessage = error instanceof Error ? error.message : String(error);
	log('error', 'API', `Failure: ${endpoint} (attempt ${attempt}, ${latency || 'N/A'}ms)`, {
		error: errorMessage
	});
}

export const logger = {
	debug: (context: string, message: string, meta?: Record<string, unknown>) =>
		log('debug', context, message, meta),
	info: (context: string, message: string, meta?: Record<string, unknown>) =>
		log('info', context, message, meta),
	warn: (context: string, message: string, meta?: Record<string, unknown>) =>
		log('warn', context, message, meta),
	error: (context: string, message: string, meta?: Record<string, unknown>) =>
		log('error', context, message, meta),
	getCurrentLogLevel
};
