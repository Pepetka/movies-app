export interface QueryState<T> {
	data: T | null;
	error: Error | null;
	isFetching: boolean;
}

export interface QueryOptions<T> {
	key: unknown[];
	fetcher: (signal: AbortSignal) => Promise<T>;
	tags?: string[];
	debug?: boolean;
}

export interface QueryActions {
	refetch: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
}

export interface QueryResult<T> extends QueryState<T> {
	readonly isError: boolean;
	refetch: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
}

export interface RegistryEntry {
	key: unknown[];
	tags: string[];
	actions: QueryActions;
}
