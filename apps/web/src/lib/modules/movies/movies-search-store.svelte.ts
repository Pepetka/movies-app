import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import type { ProviderMovieSummary } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';
import { DEBOUNCE, debounce } from '$lib/utils';

import { searchMovies } from './api';

type SearchResponse = { results: ProviderMovieSummary[] };

class MoviesSearchStore extends BaseStore {
	private readonly _query: QueryResult<SearchResponse, string>;
	private readonly _debouncedSearch: ((query: string) => void) & { cancel: () => void };

	constructor() {
		super();

		this._query = createQuery<SearchResponse, string>({
			key: ['movies', 'search'],
			tags: ['movies'],
			fetcher: (signal, query) => searchMovies(query ?? '', signal),
			debug: !__IS_PROD__
		});

		this._debouncedSearch = debounce((query: string) => {
			if (query.trim()) {
				void this._query.refetch(query);
			} else {
				this._query.reset();
			}
		}, DEBOUNCE);
	}

	// === Геттеры — делегируют к query ===

	get results(): ProviderMovieSummary[] {
		return this._query.data?.results ?? [];
	}

	get status(): FetchStatus {
		return this._query.status;
	}

	get isLoading(): boolean {
		return this._query.isLoading;
	}

	get isLoaded(): boolean {
		return this._query.isLoaded;
	}

	get isFetching(): boolean {
		return this._query.isFetching;
	}

	get isError(): boolean {
		return this._query.isError;
	}

	get error(): string | null {
		if (!this._query.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка поиска');
	}

	get isEmpty(): boolean {
		return this.results.length === 0;
	}

	// === Действия ===

	search(query: string): void {
		this._debouncedSearch(query);
	}

	clear(): void {
		this._debouncedSearch.cancel();
		this._query.reset();
	}

	cancel(): void {
		this._debouncedSearch.cancel();
	}

	reset(): void {
		this._debouncedSearch.cancel();
		this._query.reset();
	}
}

export const moviesSearchStore = new MoviesSearchStore();
