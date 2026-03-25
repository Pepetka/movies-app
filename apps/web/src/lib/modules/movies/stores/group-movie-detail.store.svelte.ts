import { untrack } from 'svelte';

import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import type { GroupMovieResponseDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import { mapToUnified, type UnifiedMovie } from '../types';
import { getGroupMovie } from '../api';

interface MovieParams {
	groupId: number;
	movieId: number;
}

class GroupMovieDetailStore extends BaseStore {
	private readonly _query: QueryResult<GroupMovieResponseDto, MovieParams>;

	constructor() {
		super();

		this._query = createQuery<GroupMovieResponseDto, MovieParams>({
			key: ['group-movie'],
			tags: ['group-movie'],
			fetcher: (signal, params) => {
				if (!params?.groupId || !params?.movieId) throw new Error('No ids');
				return getGroupMovie(params.groupId, params.movieId, signal);
			},
			debug: !__IS_PROD__
		});
	}

	get movie(): UnifiedMovie | null {
		return this._query.data ? mapToUnified(this._query.data) : null;
	}

	get rawMovie(): GroupMovieResponseDto | null {
		return this._query.data ?? null;
	}

	get currentUserRole(): string | null {
		return this._query.data?.currentUserRole ?? null;
	}

	get isModerator(): boolean {
		const role = this.currentUserRole;
		return role === 'moderator' || role === 'admin';
	}

	get isAdmin(): boolean {
		return this.currentUserRole === 'admin';
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
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки фильма');
	}

	async fetchMovie(groupId: number, movieId: number): Promise<void> {
		return untrack(async () => {
			const key = ['group-movie', groupId, movieId];
			if (this._query.isCurrentKey(key) && (this.isLoaded || this.isFetching)) return;
			await this._query.revalidate(key, { groupId, movieId });
		});
	}

	reset(): void {
		this._query.reset();
	}
}

export const groupMovieDetailStore = new GroupMovieDetailStore();
