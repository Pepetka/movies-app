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

class GroupsStore extends BaseStore {
	private _query: QueryResult<GroupResponseDto[]> | null = null;
	private _groupQuery: QueryResult<GroupResponseDto> | null = null;
	private _currentGroupId: number | null = null;

	formStatus = $state<GroupFormStatus>('idle');
	formError = $state<string | null>(null);
	currentGroup = $state<GroupResponseDto | null>(null);

	constructor() {
		super();
		this._query = createQuery<GroupResponseDto[]>({
			key: ['groups'],
			tags: ['groups'],
			fetcher: (signal) => getGroups(signal),
			debug: !__IS_PROD__
		});
	}

	private _getGroupQuery(id: number): QueryResult<GroupResponseDto> {
		if (this._groupQuery && this._currentGroupId === id) {
			return this._groupQuery;
		}

		this._groupQuery?.destroy();
		this._groupQuery = createQuery<GroupResponseDto>({
			key: ['group', id],
			tags: ['groups'],
			fetcher: (signal) => getGroupApi(id, signal),
			debug: !__IS_PROD__
		});
		this._currentGroupId = id;
		return this._groupQuery;
	}

	get groups(): GroupResponseDto[] {
		return this._query?.data ?? [];
	}

	get status(): GroupsStatus {
		if (!this._query) return 'idle';
		if (this._query.isFetching && this.groups.length === 0) return 'loading';
		if (this._query.error) return 'error';
		if (this.groups.length > 0) return 'loaded';
		return 'idle';
	}

	get error(): string | null {
		if (!this._query?.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки групп');
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
		await this._query?.refetch();
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
		this._groupQuery?.destroy();
		this._groupQuery = null;
		this._currentGroupId = null;
	}

	reset(): void {
		this._query?.reset();
		this.resetForm();
	}

	destroy(): void {
		this._query?.destroy();
		this._query = null;
		this.resetForm();
	}
}

export const groupsStore = new GroupsStore();
