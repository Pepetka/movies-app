interface ErrorBody {
	message?: string | string[];
	error?: string;
}

export class HttpError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public body?: unknown
	) {
		super(`HTTP ${status}: ${statusText}`);
		this.name = 'HttpError';
	}

	getErrorMessage(): string {
		const body = this.body as ErrorBody | undefined;
		if (!body) return this.message;

		if (Array.isArray(body.message) && body.message.length > 0) {
			return body.message.join(', ');
		}

		if (typeof body.message === 'string') {
			return body.message;
		}

		return this.message;
	}
}

export class AuthError extends HttpError {
	constructor(body?: unknown) {
		super(401, 'Unauthorized', body);
		this.name = 'AuthError';
	}
}

export class NetworkError extends Error {
	constructor(message: string = 'Ошибка сети') {
		super(message);
		this.name = 'NetworkError';
	}

	getErrorMessage(): string {
		return this.message;
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

	getErrorMessage(): string {
		if (this.lastError instanceof HttpError || this.lastError instanceof NetworkError) {
			return this.lastError.getErrorMessage();
		}
		return `Ошибка после ${this.attempts} попыток`;
	}
}
