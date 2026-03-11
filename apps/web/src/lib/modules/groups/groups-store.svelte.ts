import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import type { GroupResponseDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import { getGroups } from './api';

class GroupsStore extends BaseStore {
	private _query: QueryResult<GroupResponseDto[]> | null = null;

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
		return this._query?.data ?? [];
	}

	get status(): FetchStatus {
		if (!this._query) return 'idle';
		return this._query.status;
	}

	get error(): string | null {
		if (!this._query?.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки групп');
	}

	get isEmpty(): boolean {
		return this.groups.length === 0;
	}

	async fetchGroups(): Promise<void> {
		if (this.status === 'loaded') return;
		await this._query?.refetch();
	}

	async refetch(): Promise<void> {
		await this._query?.refetch();
	}

	reset(): void {
		this._query?.reset();
	}

	destroy(): void {
		this._query?.destroy();
		this._query = null;
	}
}

export const groupsStore = new GroupsStore();
