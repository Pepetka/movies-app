import { untrack } from 'svelte';

import type { UserResponseDto, UserUpdateDto } from '$lib/api/generated/types';
import { createMutation, type MutationResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import { updateUser as apiUpdateUser } from '../api';

class ProfileStore extends BaseStore {
	private readonly _updateMutation: MutationResult<
		UserResponseDto,
		{ id: number; data: UserUpdateDto }
	>;

	constructor() {
		super();

		this._updateMutation = createMutation<UserResponseDto, { id: number; data: UserUpdateDto }>({
			key: ['profile', 'update'],
			tags: ['user', 'group-members', 'group-movie'],
			mutator: ({ id, data }) => apiUpdateUser(id, data),
			debug: !__IS_PROD__
		});
	}

	// === Update profile mutation ===

	get isUpdating(): boolean {
		return this._updateMutation.isSubmitting;
	}

	get isUpdateSuccess(): boolean {
		return this._updateMutation.isSuccess;
	}

	get updateError(): string | null {
		if (!this._updateMutation.error) return null;
		return this._extractErrorMessage(this._updateMutation.error, 'Ошибка обновления профиля');
	}

	async updateProfile(id: number, data: UserUpdateDto): Promise<UserResponseDto | null> {
		return untrack(() => this._updateMutation.mutate({ id, data }));
	}

	resetUpdate(): void {
		this._updateMutation.reset();
	}
}

export const profileStore = new ProfileStore();
