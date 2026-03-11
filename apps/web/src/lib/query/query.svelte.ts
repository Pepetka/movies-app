import type { FetchStatus, QueryOptions, QueryResult, QueryState } from './types';
import { queryRegistry } from './registry.svelte';

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));
const isAbortError = (e: unknown): boolean => e instanceof Error && e.name === 'AbortError';

class Query<T, K = never> implements QueryResult<T, K> {
	private readonly _fetcher: (signal: AbortSignal, params?: K | null) => Promise<T>;
	private readonly _tags: string[];
	private readonly _debug: boolean;

	private _state = $state<QueryState<T>>({
		data: null,
		error: null,
		isFetching: false
	});

	private _params: K | null;
	private _key: unknown[];
	private _controller: AbortController | null = null;
	private _unregister: (() => void) | null = null;

	constructor(options: QueryOptions<T, K>) {
		const { fetcher, key, tags = [], debug = false, params = null } = options;

		this._fetcher = fetcher;
		this._tags = tags;
		this._debug = debug;
		this._params = params;
		this._key = key;

		this._register();
	}

	get data(): T | null {
		return this._state.data;
	}

	get error(): Error | null {
		return this._state.error;
	}

	get isFetching(): boolean {
		return this._state.isFetching;
	}

	get isError(): boolean {
		return this._state.error !== null;
	}

	get status(): FetchStatus {
		if (this._state.isFetching && this._state.data === null) return 'loading';
		if (this._state.isFetching) return 'fetching';
		if (this._state.error) return 'error';
		if (this._state.data !== null) return 'loaded';
		return 'idle';
	}

	isCurrentKey(key: unknown[]): boolean {
		return JSON.stringify(key) === JSON.stringify(this._key);
	}

	async fetch(): Promise<void> {
		this._controller?.abort();
		this._controller = new AbortController();

		this._state.isFetching = true;
		this._state.error = null;

		try {
			const data = await this._fetcher(this._controller.signal, this._params);
			this._state.data = data;
		} catch (e) {
			if (isAbortError(e)) return;
			this._state.error = toError(e);
		} finally {
			this._state.isFetching = false;
		}
	}

	reset(): void {
		this._controller?.abort();
		this._state.data = null;
		this._state.error = null;
		this._state.isFetching = false;
	}

	destroy(): void {
		this._controller?.abort();
		this.reset();
		if (this._unregister) {
			this._unregister();
			this._unregister = null;
		}
	}

	async revalidate(newKey: unknown[], newParams?: K | null): Promise<void> {
		this.reset();

		if (this._unregister) this._unregister();

		this._key = newKey;
		this._params = newParams ?? null;

		this._register();

		await this.fetch();
	}

	private _register(): void {
		this._unregister = queryRegistry.register(
			this._key,
			this._tags,
			{ fetch: () => this.fetch(), reset: () => this.reset(), destroy: () => this.destroy() },
			this._debug
		);
	}
}

export const createQuery = <T, K = never>(options: QueryOptions<T, K>): QueryResult<T, K> => {
	return new Query(options);
};
