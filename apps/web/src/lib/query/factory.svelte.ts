import type { QueryOptions, QueryResult, QueryState } from './types';
import { queryRegistry } from './registry.svelte';

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));
const isAbortError = (e: unknown): boolean => e instanceof Error && e.name === 'AbortError';

export const createQuery = <T>(options: QueryOptions<T>): QueryResult<T> => {
	const { key, fetcher, tags = [], enabled = true, debug = false } = options;

	const state = $state<QueryState<T>>({
		data: null,
		error: null,
		isFetching: false
	});

	let controller: AbortController | null = null;

	const refetch = async (): Promise<void> => {
		controller?.abort();
		controller = new AbortController();

		state.isFetching = true;
		state.error = null;

		try {
			const data = await fetcher(controller.signal);
			state.data = data;
		} catch (e) {
			if (isAbortError(e)) return;
			state.error = toError(e);
		} finally {
			state.isFetching = false;
		}
	};

	const reset = (): void => {
		controller?.abort();
		state.data = null;
		state.error = null;
		state.isFetching = false;
	};

	const unregister = queryRegistry.register(key, tags, { refetch, reset }, debug);

	$effect(() => {
		if (enabled) {
			void refetch();
		}
		return () => {
			controller?.abort();
			unregister();
		};
	});

	return {
		get data() {
			return state.data;
		},
		get error() {
			return state.error;
		},
		get isFetching() {
			return state.isFetching;
		},
		get isError() {
			return state.error !== null;
		},
		refetch,
		reset
	};
};
