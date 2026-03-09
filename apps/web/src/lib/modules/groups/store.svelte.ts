import type { GroupResponseDto } from '$lib/api/generated/types';
import { createQuery, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import type { GroupsStatus } from './types';
import { getGroups } from './api';

class GroupsStore extends BaseStore {
	groups = $state<GroupResponseDto[]>([]);
	status = $state<GroupsStatus>('idle');
	error = $state<string | null>(null);

	private _query: QueryResult<GroupResponseDto[]> | null = null;

	private _getQuery(): QueryResult<GroupResponseDto[]> {
		if (!this._query) {
			this._query = createQuery<GroupResponseDto[]>({
				key: ['groups'],
				tags: ['groups'],
				fetcher: (signal) => getGroups(signal),
				enabled: false,
				debug: import.meta.env.DEV
			});
		}
		return this._query;
	}

	get isFetching(): boolean {
		return this._query?.isFetching ?? false;
	}

	get isEmpty(): boolean {
		return this.groups.length === 0 && !this.isFetching;
	}

	async fetchGroups(): Promise<void> {
		this.status = 'loading';
		const query = this._getQuery();

		await query.refetch();

		if (query.error) {
			this.status = 'error';
			this.error = this._extractErrorMessage(query.error, 'Ошибка загрузки групп');
			this._log('error', 'Failed to fetch groups', { error: query.error });
		} else if (query.data) {
			this.groups = query.data;
			this.status = 'loaded';
			this.error = null;
		} else {
			this.status = 'idle';
		}
	}

	async refetch(): Promise<void> {
		return this.fetchGroups();
	}

	reset(): void {
		this._query?.reset();
		this.groups = [];
		this.status = 'idle';
		this.error = null;
	}

	destroy(): void {
		this.reset();
		this._query = null;
	}
}

export const groupsStore = new GroupsStore();
