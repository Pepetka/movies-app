import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';
import { createQuery, queryRegistry, type FetchStatus, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	createGroup as createGroupApi,
	getGroup as getGroupApi,
	updateGroup as updateGroupApi
} from './api';
import type { PostStatus } from './types';

class GroupStore extends BaseStore {
	private readonly _query: QueryResult<GroupResponseDto, number>;

	constructor() {
		super();
		this._query = createQuery<GroupResponseDto, number>({
			key: ['group'],
			tags: ['group'],
			fetcher: (signal, id) => {
				if (!id) throw new Error('No group id');
				return getGroupApi(id, signal);
			},
			debug: !__IS_PROD__
		});
	}

	get currentGroup(): GroupResponseDto | null {
		return this._query.data ?? null;
	}

	get status(): FetchStatus {
		return this._query.status;
	}

	get error(): string | null {
		if (!this._query.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки групп');
	}

	async fetchGroup(id: number): Promise<void> {
		if (this._query.isCurrentKey(['group', id]) && this.status === 'loaded') return;
		await this._query.revalidate(['group', id], id);
	}

	// forms

	formStatus = $state<PostStatus>('idle');
	formError = $state<string | null>(null);

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
			queryRegistry.invalidateByTag('groups');
			queryRegistry.invalidateByKey(['group', id]);
			return group;
		} catch (error) {
			this.formStatus = 'error';
			this.formError = this._extractErrorMessage(error, 'Ошибка обновления группы');
			this._log('error', 'Failed to update group', { error });
			return null;
		}
	}

	reset(): void {
		this._query.reset();
	}

	resetForm(): void {
		this.formStatus = 'idle';
		this.formError = null;
	}
}

export const groupStore = new GroupStore();
