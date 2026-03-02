import type { RequestOptions } from './types';
import { httpClient } from './client';

type OrvalMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface OrvalRequestConfig {
	url: string;
	method: OrvalMethod;
	headers?: Record<string, string>;
	data?: unknown;
	params?: Record<string, unknown>;
}

export const customInstance = async <T>(
	config: OrvalRequestConfig,
	options?: RequestOptions
): Promise<T> => {
	const { url, method, data, params, headers } = config;
	const { signal, ...restOptions } = options ?? {};

	return httpClient.request<T>(url, {
		method,
		body: data,
		params,
		headers,
		signal,
		...restOptions
	});
};
