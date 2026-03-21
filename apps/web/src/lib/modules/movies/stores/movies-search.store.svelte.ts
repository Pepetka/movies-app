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
		{ groupId: number; query: string }
	>;
	private readonly _debouncedSearch: ((groupId: number, query: string) => void) & {
		cancel: () => void;
	};

	constructor() {
		super();

		this._query = createQuery<SearchInGroupResponseDto, { groupId: number; query: string }>({
			key: ['movies', 'search'],
			tags: ['group-movies'],
			fetcher: (signal, params) => {
				if (!params?.groupId) {
					throw new Error('No group id');
				}
				const { groupId, query } = params;
				return groupMoviesControllerSearchInGroupV1(Number(groupId), { query }, { signal });
			},
			debug: !__IS_PROD__
		});

		this._debouncedSearch = debounce((groupId: number, query: string) => {
			if (query.trim()) {
				void this._query.revalidate(['movies', 'search', groupId, query], { groupId, query });
			} else {
				this._query.reset();
			}
		}, DEBOUNCE);
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

	search(groupId: number, query: string): void {
		this._debouncedSearch(groupId, query);
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
