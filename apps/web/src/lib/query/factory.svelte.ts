import { logger } from '$lib/utils/logger';

import type { QueryOptions, QueryResult, QueryState } from './types';
import { queryRegistry } from './registry.svelte';

export const createQuery = <T>(options: QueryOptions<T>): QueryResult<T> => {
	const { key, fetcher, tags = [], enabled = true, debug = false } = options;

	const state = $state<QueryState<T>>({
		data: null,
		error: null,
		isFetching: false,
		isError: false
	});

	const log = (message: string, meta?: Record<string, unknown>): void => {
		if (debug) {
			logger.debug('Query', message, { key, ...meta });
		}
	};

	const refetch = async (): Promise<void> => {
		log('Fetch started');
		state.isFetching = true;
		state.isError = false;
		state.error = null;

		try {
			const data = await fetcher();
			state.data = data;
			log('Fetch success');
		} catch (e) {
			state.isError = true;
			state.error = e instanceof Error ? e : new Error(String(e));
			log('Fetch error', { error: state.error.message });
		} finally {
			state.isFetching = false;
		}
	};

	const reset = (): void => {
		log('Reset');
		state.data = null;
		state.error = null;
		state.isFetching = false;
		state.isError = false;
	};

	const unregister = queryRegistry.register(key, tags, { refetch, reset });

	$effect(() => {
		if (enabled) {
			void refetch();
		}
		return unregister;
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
			return state.isError;
		},
		refetch,
		reset
	};
};
