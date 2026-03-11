import type { FetchStatus, QueryOptions, QueryResult, QueryState } from './types';
import { queryRegistry } from './registry.svelte';

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));
const isAbortError = (e: unknown): boolean => e instanceof Error && e.name === 'AbortError';

export const createQuery = <T, K = never>(options: QueryOptions<T, K>): QueryResult<T, K> => {
	const { fetcher, key, tags = [], debug = false, params = null } = options;

	const state = $state<QueryState<T>>({
		data: null,
		error: null,
		isFetching: false
	});

	let fetcherParams = params;
	let fetchKey = key;

	let controller: AbortController | null = null;
	let registered = false;
	let unregister: () => void;

	const refetch = async (): Promise<void> => {
		controller?.abort();
		controller = new AbortController();

		state.isFetching = true;
		state.error = null;

		try {
			const data = await fetcher(controller.signal, fetcherParams);
			state.data = data;
		} catch (e) {
			if (isAbortError(e)) return;
			state.error = toError(e);
		} finally {
			state.isFetching = false;
		}
	};

	const getStatus = (): FetchStatus => {
		if (state.isFetching && state.data === null) return 'loading';
		if (state.isFetching) return 'fetching';
		if (state.error) return 'error';
		if (state.data !== null) return 'loaded';
		return 'idle';
	};

	const reset = (): void => {
		controller?.abort();
		state.data = null;
		state.error = null;
		state.isFetching = false;
	};

	const destroy = (): void => {
		controller?.abort();
		reset();
		if (registered) {
			unregister();
			registered = false;
		}
	};

	const revalidate = async (newKey: unknown[], newParams?: K | null): Promise<void> => {
		reset();

		if (registered) unregister();

		registered = true;
		unregister = queryRegistry.register(newKey, tags, { refetch, reset, destroy }, debug);

		fetchKey = newKey;
		fetcherParams = newParams ?? null;

		await refetch();
	};

	unregister = queryRegistry.register(fetchKey, tags, { refetch, reset, destroy }, debug);
	registered = true;

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
		get status() {
			return getStatus();
		},
		refetch,
		reset,
		destroy,
		revalidate
	};
};
