import { untrack } from 'svelte';

import type { GroupMovieResponseDto, ReviewResponseDto } from '$lib/api/generated/types';
import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
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
		const raw = this._query.data;
		return raw ? mapToUnified(raw) : null;
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

	get reviews(): ReviewResponseDto[] {
		return this._query.data?.reviews ?? [];
	}

	get myReview(): ReviewResponseDto | null {
		return this._query.data?.reviews?.find((r) => r.isOwn) ?? null;
	}

	get averageRating(): number | null {
		return this._query.data?.averageRating ?? null;
	}

	get reviewCount(): number {
		return this._query.data?.reviewCount ?? 0;
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
		const shouldSkip = untrack(() => {
			const key = ['group-movie', groupId, movieId];
			return this._query.isCurrentKey(key) && (this.isLoaded || this.isFetching);
		});
		if (shouldSkip) return;
		await this._query.revalidate(['group-movie', groupId, movieId], { groupId, movieId });
	}

	abort(): void {
		this._query.abort();
	}

	reset(): void {
		this._query.reset();
	}
}

export const groupMovieDetailStore = new GroupMovieDetailStore();
