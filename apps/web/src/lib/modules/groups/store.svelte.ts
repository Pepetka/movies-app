import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';
import { createQuery, queryRegistry, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	createGroup as createGroupApi,
	getGroup as getGroupApi,
	getGroups,
	updateGroup as updateGroupApi
} from './api';
import type { GroupFormStatus, GroupsStatus } from './types';

const MAX_CACHED_GROUPS = 3;

class GroupsStore extends BaseStore {
	groups = $state<GroupResponseDto[]>([]);
	status = $state<GroupsStatus>('idle');
	error = $state<string | null>(null);

	formStatus = $state<GroupFormStatus>('idle');
	formError = $state<string | null>(null);
	currentGroup = $state<GroupResponseDto | null>(null);

	private _query: QueryResult<GroupResponseDto[]> | null = null;
	private _groupQueries = new Map<number, QueryResult<GroupResponseDto>>();
	private _groupQueryOrder: number[] = [];

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

	private _evictOldestQuery(): void {
		if (this._groupQueryOrder.length <= MAX_CACHED_GROUPS) return;

		const oldestId = this._groupQueryOrder.shift();
		if (oldestId !== undefined) {
			const query = this._groupQueries.get(oldestId);
			query?.reset();
			this._groupQueries.delete(oldestId);
		}
	}

	private _getGroupQuery(id: number): QueryResult<GroupResponseDto> {
		if (!this._groupQueries.has(id)) {
			const query = createQuery<GroupResponseDto>({
				key: ['group', id],
				tags: ['groups'],
				fetcher: (signal) => getGroupApi(id, signal),
				enabled: false,
				debug: import.meta.env.DEV
			});
			this._groupQueries.set(id, query);
			this._groupQueryOrder.push(id);
			this._evictOldestQuery();
		}
		return this._groupQueries.get(id)!;
	}

	get isFetching(): boolean {
		return this._query?.isFetching ?? false;
	}

	get isEmpty(): boolean {
		return this.groups.length === 0 && !this.isFetching;
	}

	get isSubmitting(): boolean {
		return this.formStatus === 'submitting';
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

	async fetchGroup(id: number): Promise<void> {
		this.formStatus = 'idle';
		this.formError = null;

		const query = this._getGroupQuery(id);
		await query.refetch();

		if (query.error) {
			this.formStatus = 'error';
			this.formError = this._extractErrorMessage(query.error, 'Ошибка загрузки группы');
			this._log('error', 'Failed to fetch group', { error: query.error });
		} else if (query.data) {
			this.currentGroup = query.data;
		}
	}

	async createGroup(data: GroupCreateDto): Promise<GroupResponseDto | null> {
		this.formStatus = 'submitting';
		this.formError = null;

		try {
			const group = await createGroupApi(data);
			this.formStatus = 'success';
			queryRegistry.invalidateByTag('groups');
			return group;
		} catch (error) {
			this.formStatus = 'error';
			this.formError = this._extractErrorMessage(error, 'Ошибка создания группы');
			this._log('error', 'Failed to create group', { error });
			return null;
		}
	}

	async updateGroup(id: number, data: GroupUpdateDto): Promise<GroupResponseDto | null> {
		this.formStatus = 'submitting';
		this.formError = null;

		try {
			const group = await updateGroupApi(id, data);
			this.formStatus = 'success';
			this.currentGroup = group;
			queryRegistry.invalidateByTag('groups');
			return group;
		} catch (error) {
			this.formStatus = 'error';
			this.formError = this._extractErrorMessage(error, 'Ошибка обновления группы');
			this._log('error', 'Failed to update group', { error });
			return null;
		}
	}

	async refetch(): Promise<void> {
		return this.fetchGroups();
	}

	resetForm(): void {
		this.formStatus = 'idle';
		this.formError = null;
		this.currentGroup = null;
		for (const query of this._groupQueries.values()) {
			query.reset();
		}
		this._groupQueries.clear();
		this._groupQueryOrder = [];
	}

	reset(): void {
		this._query?.reset();
		this.groups = [];
		this.status = 'idle';
		this.error = null;
		this.resetForm();
	}

	destroy(): void {
		this.reset();
		this._query = null;
	}
}

export const groupsStore = new GroupsStore();
