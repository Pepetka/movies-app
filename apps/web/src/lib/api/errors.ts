export class HttpError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public body?: unknown
	) {
		super(`HTTP ${status}: ${statusText}`);
		this.name = 'HttpError';
	}
}

export class AuthError extends HttpError {
	constructor(body?: unknown) {
		super(401, 'Unauthorized', body);
		this.name = 'AuthError';
	}
}

export class NetworkError extends Error {
	constructor(message: string = 'Network error') {
		super(message);
		this.name = 'NetworkError';
	}
}

export class RetryError extends Error {
	constructor(
		public attempts: number,
		public lastError: Error
	) {
		super(`All ${attempts} retry attempts failed`);
		this.name = 'RetryError';
	}
}
