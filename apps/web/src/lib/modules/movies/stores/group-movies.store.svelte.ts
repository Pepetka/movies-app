import type { CustomMovieResponseDto, GroupMovieResponseDto } from '$lib/api/generated/types';
import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	mapCustomMovieToUnified,
	mapGroupMovieToUnified,
	type MovieStatus,
	type UnifiedMovie
} from '../types';
import { getCustomMovies, getGroupMovies } from '../api';

class GroupMoviesStore extends BaseStore {
	private readonly _providerQuery: QueryResult<GroupMovieResponseDto[], number>;
	private readonly _customQuery: QueryResult<CustomMovieResponseDto[], number>;

	constructor() {
		super();

		this._providerQuery = createQuery<GroupMovieResponseDto[], number>({
			key: ['group-movies', 'provider'],
			tags: ['group-movies'],
			fetcher: async (signal, groupId) => {
				if (!groupId) throw new Error('No group id');
				return getGroupMovies(groupId, signal);
			},
			debug: !__IS_PROD__
		});

		this._customQuery = createQuery<CustomMovieResponseDto[], number>({
			key: ['group-movies', 'custom'],
			tags: ['group-movies'],
			fetcher: (signal, groupId) => {
				if (!groupId) throw new Error('No group id');
				return getCustomMovies(groupId, signal);
			},
			debug: !__IS_PROD__
		});
	}

	// === Combined state ===

	get status(): FetchStatus {
		if (this.isLoading) return 'loading';
		if (this.isFetching) return 'fetching';
		if (this.isError) return 'error';
		if (this.isLoaded) return 'loaded';
		return 'idle';
	}

	get isLoading(): boolean {
		return this._providerQuery.isLoading || this._customQuery.isLoading;
	}

	get isLoaded(): boolean {
		return this._providerQuery.isLoaded && this._customQuery.isLoaded;
	}

	get isFetching(): boolean {
		return this._providerQuery.isFetching || this._customQuery.isFetching;
	}

	get isError(): boolean {
		return this._providerQuery.isError || this._customQuery.isError;
	}

	get error(): string | null {
		if (this._providerQuery.error) {
			return this._extractErrorMessage(this._providerQuery.error, 'Ошибка загрузки фильмов');
		}
		if (this._customQuery.error) {
			return this._extractErrorMessage(this._customQuery.error, 'Ошибка загрузки фильмов');
		}
		return null;
	}

	// === Movies ===

	get providerMovies(): GroupMovieResponseDto[] {
		return this._providerQuery.data ?? [];
	}

	get customMovies(): CustomMovieResponseDto[] {
		return this._customQuery.data ?? [];
	}

	get movies(): UnifiedMovie[] {
		const providerUnified = this.providerMovies.map(mapGroupMovieToUnified);
		const customUnified = this.customMovies.map(mapCustomMovieToUnified);
		return [...providerUnified, ...customUnified];
	}

	get isEmpty(): boolean {
		return this.providerMovies.length === 0 && this.customMovies.length === 0;
	}

	// === Filtered movies ===

	getMoviesByStatus(status: MovieStatus): UnifiedMovie[] {
		return this.movies.filter((m) => m.status === status);
	}

	// === Fetch ===

	async fetchMovies(groupId: number): Promise<void> {
		const providerKey = ['group-movies', 'provider', groupId];
		const customKey = ['group-movies', 'custom', groupId];

		if (
			this._providerQuery.isCurrentKey(providerKey) &&
			this._customQuery.isCurrentKey(customKey) &&
			this.isLoaded
		) {
			return;
		}

		await Promise.all([
			this._providerQuery.revalidate(providerKey, groupId),
			this._customQuery.revalidate(customKey, groupId)
		]);
	}

	async fetch(): Promise<void> {
		await Promise.all([this._providerQuery.fetch(), this._customQuery.fetch()]);
	}

	reset(): void {
		this._providerQuery.reset();
		this._customQuery.reset();
	}
}

export const groupMoviesStore = new GroupMoviesStore();
