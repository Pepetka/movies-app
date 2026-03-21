import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import type { GroupMovieResponseDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import { mapToUnified, type MovieStatus, type UnifiedMovie } from '../types';
import { getGroupMovies } from '../api';

class GroupMoviesStore extends BaseStore {
	private readonly _query: QueryResult<GroupMovieResponseDto[], number>;

	constructor() {
		super();

		this._query = createQuery<GroupMovieResponseDto[], number>({
			key: ['group-movies'],
			tags: ['group-movies'],
			fetcher: (signal, groupId) => {
				if (!groupId) throw new Error('No group id');
				return getGroupMovies(groupId, signal);
			},
			debug: !__IS_PROD__
		});
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
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки фильмов');
	}

	get movies(): UnifiedMovie[] {
		return (this._query.data ?? []).map(mapToUnified);
	}

	get isEmpty(): boolean {
		return this.movies.length === 0;
	}

	getMoviesByStatus(status: MovieStatus): UnifiedMovie[] {
		return this.movies.filter((m) => m.status === status);
	}

	async fetchMovies(groupId: number): Promise<void> {
		const key = ['group-movies', groupId];

		if (this._query.isCurrentKey(key) && this.isLoaded) {
			return;
		}

		await this._query.revalidate(key, groupId);
	}

	async fetch(): Promise<void> {
		await this._query.fetch();
	}

	reset(): void {
		this._query.reset();
	}
}

export const groupMoviesStore = new GroupMoviesStore();
