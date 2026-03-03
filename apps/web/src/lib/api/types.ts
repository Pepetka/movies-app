export interface RequestOptions {
	signal?: AbortSignal;
	headers?: Record<string, string>;
	params?: Record<string, unknown>;
}

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export interface HttpClientConfig {
	baseURL: string;
	timeout?: number;
	debug?: boolean;

	auth: {
		refreshEndpoint: string;
		csrfEndpoint: string;
	};

	retry?: {
		count: number;
		delay: number;
		retryOn: number[];
	};
}

export const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504] as const;
