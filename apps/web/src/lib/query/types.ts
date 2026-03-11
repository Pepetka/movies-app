// === Query ===

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
	fetch: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
}

export interface QueryResult<T, K = never> extends QueryState<T> {
	readonly isError: boolean;
	fetch: () => Promise<void>;
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

// === Mutation ===

export interface MutationState<T> {
	data: T | null;
	error: Error | null;
	isSubmitting: boolean;
}

export interface MutationOptions<T, V> {
	key: unknown[];
	mutator: (variables: V) => Promise<T>;
	tags?: string[];
	invalidateKeys?: (data: T, variables: V) => unknown[][];
	debug?: boolean;
}

export type PostStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface MutationResult<T, V> extends MutationState<T> {
	readonly isError: boolean;
	mutate: (variables: V) => Promise<T | null>;
	reset: () => void;
	status: PostStatus;
}
