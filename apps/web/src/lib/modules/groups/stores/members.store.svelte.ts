import { untrack } from 'svelte';

import {
	createMutation,
	createQuery,
	type FetchStatus,
	type MutationResult,
	type QueryResult
} from '$lib/query';
import type {
	GroupMemberResponseDto,
	GroupMemberRoleUpdateDtoRole
} from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	getGroupMembers as getGroupMembersApi,
	updateMemberRole as updateMemberRoleApi,
	removeMember as removeMemberApi,
	transferOwnership as transferOwnershipApi
} from '../api';

class MembersStore extends BaseStore {
	private readonly _query: QueryResult<GroupMemberResponseDto[], number>;
	private readonly _removeMutation: MutationResult<void, { groupId: number; userId: number }>;
	private readonly _updateRoleMutation: MutationResult<
		void,
		{ groupId: number; userId: number; role: GroupMemberRoleUpdateDtoRole }
	>;
	private readonly _transferMutation: MutationResult<
		void,
		{ groupId: number; targetUserId: number }
	>;

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

		this._removeMutation = createMutation<void, { groupId: number; userId: number }>({
			key: ['group-member', 'remove'],
			tags: ['group-members'],
			mutator: ({ groupId, userId }) => removeMemberApi(groupId, userId),
			debug: !__IS_PROD__
		});

		this._updateRoleMutation = createMutation<
			void,
			{ groupId: number; userId: number; role: GroupMemberRoleUpdateDtoRole }
		>({
			key: ['group-member', 'update-role'],
			tags: ['group-members'],
			mutator: ({ groupId, userId, role }) => updateMemberRoleApi(groupId, userId, role),
			debug: !__IS_PROD__
		});

		this._transferMutation = createMutation<void, { groupId: number; targetUserId: number }>({
			key: ['group-member', 'transfer'],
			tags: ['group-members', 'groups'],
			mutator: ({ groupId, targetUserId }) => transferOwnershipApi(groupId, targetUserId),
			invalidateKeys: (_, { groupId }) => [['group', groupId]],
			debug: !__IS_PROD__
		});
	}

	// === Query геттеры ===

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

	// === Remove mutation ===

	get isRemoving(): boolean {
		return this._removeMutation.isSubmitting;
	}

	get isRemoveSuccess(): boolean {
		return this._removeMutation.isSuccess;
	}

	get removeError(): string | null {
		if (!this._removeMutation.error) return null;
		return this._extractErrorMessage(this._removeMutation.error, 'Ошибка удаления участника');
	}

	async removeMember(groupId: number, userId: number): Promise<void> {
		await untrack(() => this._removeMutation.mutate({ groupId, userId }));
	}

	resetRemove(): void {
		this._removeMutation.reset();
	}

	// === Update role mutation ===

	get isUpdatingRole(): boolean {
		return this._updateRoleMutation.isSubmitting;
	}

	get isUpdateRoleSuccess(): boolean {
		return this._updateRoleMutation.isSuccess;
	}

	get updateRoleError(): string | null {
		if (!this._updateRoleMutation.error) return null;
		return this._extractErrorMessage(this._updateRoleMutation.error, 'Ошибка изменения роли');
	}

	async updateMemberRole(
		groupId: number,
		userId: number,
		role: GroupMemberRoleUpdateDtoRole
	): Promise<void> {
		await untrack(() => this._updateRoleMutation.mutate({ groupId, userId, role }));
	}

	resetUpdateRole(): void {
		this._updateRoleMutation.reset();
	}

	// === Transfer ownership mutation ===

	get isTransferring(): boolean {
		return this._transferMutation.isSubmitting;
	}

	get isTransferSuccess(): boolean {
		return this._transferMutation.isSuccess;
	}

	get transferError(): string | null {
		if (!this._transferMutation.error) return null;
		return this._extractErrorMessage(this._transferMutation.error, 'Ошибка передачи прав');
	}

	async transferOwnership(groupId: number, targetUserId: number): Promise<void> {
		await untrack(() => this._transferMutation.mutate({ groupId, targetUserId }));
	}

	resetTransfer(): void {
		this._transferMutation.reset();
	}

	// === Reset ===

	reset(): void {
		this._query.reset();
	}

	resetMutations(): void {
		this._removeMutation.reset();
		this._updateRoleMutation.reset();
		this._transferMutation.reset();
	}
}

export const membersStore = new MembersStore();
