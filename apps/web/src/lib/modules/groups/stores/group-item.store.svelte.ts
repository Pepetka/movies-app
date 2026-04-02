import { untrack } from 'svelte';

import {
	createMutation,
	createQuery,
	type FetchStatus,
	type MutationResult,
	type PostStatus,
	type QueryResult
} from '$lib/query';
import type {
	GroupCreateDto,
	GroupResponseDto,
	GroupResponseDtoCurrentUserRole,
	GroupUpdateDto
} from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	createGroup as createGroupApi,
	getGroup as getGroupApi,
	updateGroup as updateGroupApi,
	deleteGroup as deleteGroupApi
} from '../api';

class GroupStore extends BaseStore {
	private readonly _query: QueryResult<GroupResponseDto, number>;
	private readonly _createMutation: MutationResult<GroupResponseDto, GroupCreateDto>;
	private readonly _updateMutation: MutationResult<
		GroupResponseDto,
		{ id: number; data: GroupUpdateDto }
	>;
	private readonly _deleteMutation: MutationResult<void, number>;

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

		this._createMutation = createMutation<GroupResponseDto, GroupCreateDto>({
			key: ['group', 'create'],
			tags: ['groups'],
			mutator: createGroupApi,
			debug: !__IS_PROD__
		});

		this._updateMutation = createMutation<GroupResponseDto, { id: number; data: GroupUpdateDto }>({
			key: ['group', 'update'],
			tags: ['groups'],
			mutator: ({ id, data }) => updateGroupApi(id, data),
			invalidateKeys: (_, { id }) => [['group', id]],
			debug: !__IS_PROD__
		});

		this._deleteMutation = createMutation<void, number>({
			key: ['group', 'delete'],
			tags: ['groups'],
			mutator: (id) => deleteGroupApi(id),
			debug: !__IS_PROD__
		});
	}

	get currentGroup(): GroupResponseDto | null {
		return this._query.data ?? null;
	}

	get currentUserRole(): GroupResponseDtoCurrentUserRole | null {
		return this._query.data?.currentUserRole ?? null;
	}

	get isAdmin(): boolean {
		return this.currentUserRole === 'admin';
	}

	get isModerator(): boolean {
		return this.currentUserRole === 'moderator' || this.currentUserRole === 'admin';
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
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки группы');
	}

	get isForbidden(): boolean {
		return this._isForbidden(this._query);
	}

	async fetchGroup(id: number): Promise<void> {
		return untrack(async () => {
			if (this._query.isCurrentKey(['group', id]) && (this.isLoaded || this.isFetching)) return;
			await this._query.revalidate(['group', id], id);
		});
	}

	// Create mutation

	get createStatus(): PostStatus {
		return this._createMutation.status;
	}

	get createError(): string | null {
		if (!this._createMutation.error) return null;
		return this._extractErrorMessage(this._createMutation.error, 'Ошибка создания группы');
	}

	get isCreating(): boolean {
		return this._createMutation.isSubmitting;
	}

	get isCreateSuccess(): boolean {
		return this._createMutation.isSuccess;
	}

	get createdGroup(): GroupResponseDto | null {
		return this._createMutation.data ?? null;
	}

	async createGroup(data: GroupCreateDto): Promise<GroupResponseDto | null> {
		return untrack(() => this._createMutation.mutate(data));
	}

	resetCreate(): void {
		this._createMutation.reset();
	}

	// Update mutation

	get updateStatus(): PostStatus {
		return this._updateMutation.status;
	}

	get updateError(): string | null {
		if (!this._updateMutation.error) return null;
		return this._extractErrorMessage(this._updateMutation.error, 'Ошибка обновления группы');
	}

	get isUpdating(): boolean {
		return this._updateMutation.isSubmitting;
	}

	get isUpdateSuccess(): boolean {
		return this._updateMutation.isSuccess;
	}

	async updateGroup(id: number, data: GroupUpdateDto): Promise<GroupResponseDto | null> {
		return untrack(() => this._updateMutation.mutate({ id, data }));
	}

	resetUpdate(): void {
		this._updateMutation.reset();
	}

	// Delete mutation

	get deleteStatus(): PostStatus {
		return this._deleteMutation.status;
	}

	get deleteError(): string | null {
		if (!this._deleteMutation.error) return null;
		return this._extractErrorMessage(this._deleteMutation.error, 'Ошибка удаления группы');
	}

	get isDeleting(): boolean {
		return this._deleteMutation.isSubmitting;
	}

	get isDeleteSuccess(): boolean {
		return this._deleteMutation.isSuccess;
	}

	async deleteGroup(id: number): Promise<void> {
		await untrack(() => this._deleteMutation.mutate(id));
	}

	resetDelete(): void {
		this._deleteMutation.reset();
	}

	reset(): void {
		this._query.reset();
	}

	resetForm(): void {
		this._createMutation.reset();
		this._updateMutation.reset();
		this._deleteMutation.reset();
	}
}

export const groupStore = new GroupStore();
