import { logger } from '$lib/utils/logger';

import type { HttpClientConfig, HttpMethod, RequestOptions } from './types';
import { AuthError, HttpError, NetworkError, RetryError } from './errors';
import { DEFAULT_RETRY_STATUSES } from './types';

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/** Default number of retry attempts */
const DEFAULT_RETRY_COUNT = 3;

/** Default delay between retries in milliseconds */
const DEFAULT_RETRY_DELAY_MS = 1000;

/**
 * HTTP client with automatic token refresh, retry logic, and CSRF protection.
 *
 * @example
 * ```typescript
 * const client = new HttpClient({
 *   baseURL: 'http://localhost:8080',
 *   auth: {
 *     refreshEndpoint: '/api/v1/auth/refresh',
 *     csrfEndpoint: '/api/v1/csrf/token'
 *   }
 * });
 *
 * const data = await client.get<UserResponse>('/api/v1/users/me');
 * ```
 */
export class HttpClient {
	private _config: Required<Omit<HttpClientConfig, 'auth'>> & { auth: HttpClientConfig['auth'] };
	private _accessToken: string | null = null;
	private _csrfToken: string | null = null;
	private _refreshPromise: Promise<string> | null = null;
	private _csrfPromise: Promise<string> | null = null;

	constructor(config: HttpClientConfig) {
		this._config = {
			timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
			debug: config.debug ?? false,
			retry: {
				count: config.retry?.count ?? DEFAULT_RETRY_COUNT,
				delay: config.retry?.delay ?? DEFAULT_RETRY_DELAY_MS,
				retryOn: config.retry?.retryOn ?? [...DEFAULT_RETRY_STATUSES]
			},
			baseURL: config.baseURL,
			auth: {
				refreshEndpoint: config.auth.refreshEndpoint,
				csrfEndpoint: config.auth.csrfEndpoint,
				skipRefreshPaths: config.auth.skipRefreshPaths ?? []
			}
		};
	}

	/**
	 * Sets the access token for authenticated requests.
	 * @param token - The JWT access token
	 */
	setAccessToken(token: string): void {
		this._accessToken = token;
	}

	/**
	 * Clears all stored tokens (access token and CSRF token).
	 * Call this method on logout or when tokens become invalid.
	 */
	clearTokens(): void {
		this._accessToken = null;
		this._csrfToken = null;
	}

	/**
	 * Makes an HTTP request with automatic retry and token refresh.
	 *
	 * @typeParam T - The expected response type
	 * @param url - The URL to request (relative to baseURL or absolute)
	 * @param options - Request options including method, body, headers, params, and signal
	 * @returns Promise resolving to the response data
	 * @throws {AuthError} When token refresh fails after 401
	 * @throws {HttpError} When the server returns an error status
	 * @throws {NetworkError} When the request fails due to network issues
	 * @throws {RetryError} When all retry attempts are exhausted
	 */
	async request<T>(
		url: string,
		options?: RequestOptions & { method?: HttpMethod; body?: unknown }
	): Promise<T> {
		const { method = 'GET', body, signal, headers, params } = options ?? {};

		const fullUrl = this._buildUrl(url, params);
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= this._config.retry.count; attempt++) {
			try {
				return await this._executeRequest<T>(fullUrl, method, body, headers, signal, attempt);
			} catch (error) {
				lastError = error as Error;

				if (error instanceof AuthError) {
					throw error;
				}

				if (!this._shouldRetry(error, attempt)) {
					throw error;
				}

				this._log('Retry attempt %d/%d for %s', attempt, this._config.retry.count, url);
				await this._delay(this._config.retry.delay);
			}
		}

		throw new RetryError(this._config.retry.count, lastError!);
	}

	/**
	 * Makes a GET request.
	 * @typeParam T - The expected response type
	 * @param url - The URL to request
	 * @param options - Request options
	 */
	get<T>(url: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, { ...options, method: 'GET' });
	}

	/**
	 * Makes a POST request.
	 * @typeParam T - The expected response type
	 * @param url - The URL to request
	 * @param body - The request body
	 * @param options - Request options
	 */
	post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, { ...options, method: 'POST', body });
	}

	/**
	 * Makes a PUT request.
	 * @typeParam T - The expected response type
	 * @param url - The URL to request
	 * @param body - The request body
	 * @param options - Request options
	 */
	put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, { ...options, method: 'PUT', body });
	}

	/**
	 * Makes a PATCH request.
	 * @typeParam T - The expected response type
	 * @param url - The URL to request
	 * @param body - The request body
	 * @param options - Request options
	 */
	patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, { ...options, method: 'PATCH', body });
	}

	/**
	 * Makes a DELETE request.
	 * @typeParam T - The expected response type
	 * @param url - The URL to request
	 * @param options - Request options
	 */
	delete<T>(url: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, { ...options, method: 'DELETE' });
	}

	private async _executeRequest<T>(
		url: string,
		method: string,
		body: unknown,
		headers?: Record<string, string>,
		signal?: AbortSignal,
		attempt: number = 1
	): Promise<T> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this._config.timeout);

		let abortHandler: (() => void) | undefined;
		if (signal) {
			abortHandler = () => controller.abort();
			signal.addEventListener('abort', abortHandler);
		}

		const requestHeaders = this._buildHeaders(headers, !!body);

		try {
			this._log('[%s] %s %s', attempt, method, url);

			const response = await fetch(url, {
				method,
				headers: requestHeaders,
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
				credentials: 'include'
			});

			if (response.status === 401) {
				const skipPaths = this._config.auth.skipRefreshPaths ?? [];
				if (skipPaths.some((path) => url.includes(path))) {
					const errorBody = await this._parseBody(response);
					throw new HttpError(response.status, response.statusText, errorBody);
				}
				return await this._handle401<T>(url, method, body, headers, signal);
			}

			if (!response.ok) {
				const errorBody = await this._parseBody(response);
				throw new HttpError(response.status, response.statusText, errorBody);
			}

			return await this._parseBody<T>(response);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new NetworkError('Request aborted');
			}

			if (error instanceof TypeError) {
				throw new NetworkError('Network request failed');
			}

			throw error;
		} finally {
			clearTimeout(timeoutId);
			if (abortHandler && signal) {
				signal.removeEventListener('abort', abortHandler);
			}
		}
	}

	private async _handle401<T>(
		url: string,
		method: string,
		body: unknown,
		headers: Record<string, string> | undefined,
		signal: AbortSignal | undefined
	): Promise<T> {
		if (!this._refreshPromise) {
			this._refreshPromise = this._doRefresh();
		}

		try {
			await this._refreshPromise;
			this._refreshPromise = null;
		} catch {
			this._refreshPromise = null;
			throw new AuthError();
		}

		return await this._executeRequest<T>(url, method, body, headers, signal);
	}

	private async _doRefresh(): Promise<string> {
		let csrfToken: string;
		try {
			csrfToken = await this._getCsrfToken();
		} catch {
			throw new AuthError();
		}

		this._csrfToken = null;
		this._csrfPromise = null;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this._config.timeout);

		try {
			const response = await fetch(`${this._config.baseURL}${this._config.auth.refreshEndpoint}`, {
				method: 'POST',
				headers: {
					'X-CSRF-Token': csrfToken
				},
				credentials: 'include',
				signal: controller.signal
			});

			if (!response.ok) {
				throw new AuthError();
			}

			const data = await response.json();
			if (!data?.accessToken) {
				throw new AuthError();
			}
			this._accessToken = data.accessToken;

			return data.accessToken;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new NetworkError('Token refresh timed out');
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	private async _getCsrfToken(): Promise<string> {
		if (this._csrfToken) {
			return this._csrfToken;
		}

		if (!this._csrfPromise) {
			this._csrfPromise = this._fetchCsrfToken();
		}

		try {
			return await this._csrfPromise;
		} catch (error) {
			this._csrfPromise = null;
			throw error;
		}
	}

	private async _fetchCsrfToken(): Promise<string> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this._config.timeout);

		try {
			const response = await fetch(`${this._config.baseURL}${this._config.auth.csrfEndpoint}`, {
				credentials: 'include',
				signal: controller.signal
			});

			if (!response.ok) {
				throw new NetworkError('Failed to fetch CSRF token');
			}

			const data = await response.json();
			if (!data?.token) {
				throw new NetworkError('Invalid CSRF token response');
			}

			this._csrfToken = data.token;
			return data.token;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new NetworkError('CSRF token fetch timed out');
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	private _buildUrl(url: string, params?: Record<string, unknown>): string {
		const fullUrl = url.startsWith('http') ? url : `${this._config.baseURL}${url}`;

		if (!params) return fullUrl;

		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		}

		const separator = fullUrl.includes('?') ? '&' : '?';
		return searchParams.toString() ? `${fullUrl}${separator}${searchParams}` : fullUrl;
	}

	private _buildHeaders(
		customHeaders?: Record<string, string>,
		hasBody: boolean = false
	): Record<string, string> {
		const headers: Record<string, string> = {
			...customHeaders
		};

		if (hasBody) {
			headers['Content-Type'] = 'application/json';
		}

		if (this._accessToken) {
			headers['Authorization'] = `Bearer ${this._accessToken}`;
		}

		return headers;
	}

	private async _parseBody<T>(response: Response): Promise<T> {
		const text = await response.text();
		if (!text) return {} as T;

		try {
			return JSON.parse(text);
		} catch {
			return text as T;
		}
	}

	private _shouldRetry(error: unknown, attempt: number): boolean {
		if (attempt >= this._config.retry.count) return false;

		if (error instanceof NetworkError) return true;

		if (error instanceof HttpError) {
			return this._config.retry.retryOn.includes(error.status);
		}

		return false;
	}

	private _delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private _log(message: string, ...args: unknown[]): void {
		if (this._config.debug) {
			logger.debug('HttpClient', message, args.length > 0 ? { args } : undefined);
		}
	}
}

/** Singleton HTTP client instance for app-wide use */
export const httpClient = new HttpClient({
	baseURL: __API_URL__,
	auth: {
		refreshEndpoint: '/api/v1/auth/refresh',
		csrfEndpoint: '/api/v1/csrf/token',
		skipRefreshPaths: ['/api/v1/auth/login', '/api/v1/auth/register']
	}
});
