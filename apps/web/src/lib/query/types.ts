export interface QueryState<T> {
	data: T | null;
	error: Error | null;
	isFetching: boolean;
	isError: boolean;
}

export interface QueryOptions<T> {
	key: unknown[];
	fetcher: () => Promise<T>;
	tags?: string[];
	enabled?: boolean;
	debug?: boolean;
}

export interface QueryActions {
	refetch: () => Promise<void>;
	reset: () => void;
}

export interface QueryResult<T> extends QueryState<T> {
	refetch: () => Promise<void>;
	reset: () => void;
}

export interface RegistryEntry {
	key: unknown[];
	tags: string[];
	actions: QueryActions;
}
