import { untrack } from 'svelte';

import type {
	GroupMovieResponseDto,
	ProviderSearchResult,
	SearchInGroupResponseDto
} from '$lib/api/generated/types';
import { groupMoviesControllerSearchInGroupV1 } from '$lib/api/generated/api';
import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';
import { DEBOUNCE, debounce } from '$lib/utils';

class MoviesSearchStore extends BaseStore {
	private readonly _query: QueryResult<
		SearchInGroupResponseDto,
		{ groupId: number; query: string; yearFrom?: number; yearTo?: number }
	>;
	private readonly _debouncedSearch: ((
		groupId: number,
		query: string,
		yearFrom?: number,
		yearTo?: number
	) => void) & {
		cancel: () => void;
		pending: () => boolean;
	};

	constructor() {
		super();

		this._query = createQuery<
			SearchInGroupResponseDto,
			{ groupId: number; query: string; yearFrom?: number; yearTo?: number }
		>({
			key: ['movies', 'search'],
			tags: ['movies-search'],
			fetcher: (signal, params) => {
				if (!params?.groupId) {
					throw new Error('No group id');
				}
				const { groupId, query, yearFrom, yearTo } = params;
				return groupMoviesControllerSearchInGroupV1(
					groupId,
					{ query, yearFrom, yearTo },
					{ signal }
				);
			},
			debug: !__IS_PROD__
		});

		this._debouncedSearch = debounce(
			(groupId: number, query: string, yearFrom?: number, yearTo?: number) => {
				if (query.trim()) {
					const key = ['movies', 'search', groupId, query];
					if (yearFrom !== undefined) key.push(yearFrom);
					if (yearTo !== undefined) key.push(yearTo);
					void this._query.revalidate(key, {
						groupId,
						query,
						yearFrom,
						yearTo
					});
				} else {
					this._query.reset();
				}
			},
			DEBOUNCE
		);
	}

	get providerResults(): ProviderSearchResult {
		return (
			this._query.data?.provider ?? {
				page: 1,
				totalPages: 0,
				totalResults: 0,
				results: []
			}
		);
	}

	get currentGroup(): GroupMovieResponseDto[] {
		return this._query.data?.currentGroup ?? [];
	}

	get results(): ProviderSearchResult['results'] {
		return this.providerResults.results;
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
		return this.results.length === 0 && this.currentGroup.length === 0;
	}

	get isPending(): boolean {
		return this._debouncedSearch.pending();
	}

	search(groupId: number, query: string, yearFrom?: number, yearTo?: number): void {
		untrack(() => {
			const key = ['movies', 'search', groupId, query];
			if (yearFrom !== undefined) key.push(yearFrom);
			if (yearTo !== undefined) key.push(yearTo);
			if (this._query.isCurrentKey(key) && (this.isLoaded || this.isFetching)) {
				return;
			}
			this._debouncedSearch(groupId, query, yearFrom, yearTo);
		});
	}

	clear(): void {
		untrack(() => {
			this._debouncedSearch.cancel();
			this._query.reset();
		});
	}

	cancel(): void {
		untrack(() => this._debouncedSearch.cancel());
	}

	reset(): void {
		untrack(() => {
			this._debouncedSearch.cancel();
			this._query.reset();
		});
	}
}

export const moviesSearchStore = new MoviesSearchStore();
