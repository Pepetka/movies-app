import { untrack } from 'svelte';

import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import type { GroupResponseDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import { getGroups } from '../api';

class GroupsStore extends BaseStore {
	private readonly _query: QueryResult<GroupResponseDto[]>;

	constructor() {
		super();
		this._query = createQuery<GroupResponseDto[]>({
			key: ['groups'],
			tags: ['groups'],
			fetcher: (signal) => getGroups(signal),
			debug: !__IS_PROD__
		});
	}

	get groups(): GroupResponseDto[] {
		return this._query.data ?? [];
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
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки групп');
	}

	get isEmpty(): boolean {
		return this.groups.length === 0;
	}

	async fetchGroups(): Promise<void> {
		return untrack(async () => {
			if (this.isLoaded || this.isFetching) return;
			await this._query.fetch();
		});
	}

	async fetch(): Promise<void> {
		return untrack(() => this._query.fetch());
	}

	reset(): void {
		this._query.reset();
	}
}

export const groupsStore = new GroupsStore();
