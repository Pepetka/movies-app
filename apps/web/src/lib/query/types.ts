export interface QueryState<T> {
	data: T | null;
	error: Error | null;
	isFetching: boolean;
}

export interface QueryOptions<T, K = never> {
	key: unknown[];
	fetcher: (signal: AbortSignal, params?: K | null) => Promise<T>;
	params?: K | null;
	tags?: string[];
	debug?: boolean;
}

export type FetchStatus = 'idle' | 'loaded' | 'error' | 'loading' | 'fetching';

export interface QueryActions {
	refetch: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
}

export interface QueryResult<T, K = never> extends QueryState<T> {
	readonly isError: boolean;
	refetch: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
	revalidate: (newKey: unknown[], newParams?: K | null) => Promise<void>;
	status: FetchStatus;
	isCurrentKey: (key: unknown[]) => boolean;
}

export interface RegistryEntry {
	key: unknown[];
	tags: string[];
	actions: QueryActions;
}
