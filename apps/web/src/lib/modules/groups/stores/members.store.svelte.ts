import { untrack } from 'svelte';

import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import type { GroupMemberResponseDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import { getGroupMembers as getGroupMembersApi } from '../api';

class MembersStore extends BaseStore {
	private readonly _query: QueryResult<GroupMemberResponseDto[], number>;

	constructor() {
		super();

		this._query = createQuery<GroupMemberResponseDto[], number>({
			key: ['group-members'],
			tags: ['group-members'],
			fetcher: (signal, id) => {
				if (!id) throw new Error('No group id');
				return getGroupMembersApi(id, signal);
			},
			debug: !__IS_PROD__
		});
	}

	get members(): GroupMemberResponseDto[] {
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
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки участников');
	}

	get isForbidden(): boolean {
		return this._isForbidden(this._query);
	}

	async fetchMembers(id: number): Promise<void> {
		return untrack(async () => {
			if (this._query.isCurrentKey(['group-members', id]) && (this.isLoaded || this.isFetching))
				return;
			await this._query.revalidate(['group-members', id], id);
		});
	}

	reset(): void {
		this._query.reset();
	}
}

export const membersStore = new MembersStore();
