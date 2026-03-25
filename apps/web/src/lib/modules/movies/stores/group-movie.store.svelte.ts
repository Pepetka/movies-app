import { untrack } from 'svelte';

import type {
	AddMovieDto,
	CreateCustomMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto
} from '$lib/api/generated/types';
import { createMutation, type MutationResult, type PostStatus } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import { addProviderMovie, createCustomMovie, removeMovie, updateMovie } from '../api';

class GroupMovieStore extends BaseStore {
	private readonly _addProviderMutation: MutationResult<
		GroupMovieResponseDto,
		{ groupId: number; data: AddMovieDto }
	>;
	private readonly _createCustomMutation: MutationResult<
		GroupMovieResponseDto,
		{ groupId: number; data: CreateCustomMovieDto }
	>;
	private readonly _updateMutation: MutationResult<
		GroupMovieResponseDto,
		{ groupId: number; movieId: number; data: GroupMovieUpdateDto }
	>;
	private readonly _removeMutation: MutationResult<void, { groupId: number; movieId: number }>;

	constructor() {
		super();

		this._addProviderMutation = createMutation<
			GroupMovieResponseDto,
			{ groupId: number; data: AddMovieDto }
		>({
			key: ['group-movies', 'add'],
			tags: ['group-movies'],
			mutator: ({ groupId, data }) => addProviderMovie(groupId, data),
			debug: !__IS_PROD__
		});

		this._createCustomMutation = createMutation<
			GroupMovieResponseDto,
			{ groupId: number; data: CreateCustomMovieDto }
		>({
			key: ['group-movies', 'create'],
			tags: ['group-movies'],
			mutator: ({ groupId, data }) => createCustomMovie(groupId, data),
			debug: !__IS_PROD__
		});

		this._updateMutation = createMutation<
			GroupMovieResponseDto,
			{ groupId: number; movieId: number; data: GroupMovieUpdateDto }
		>({
			key: ['group-movies', 'update'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, data }) => updateMovie(groupId, movieId, data),
			invalidateKeys: (_, { groupId, movieId }) => [['group-movie', groupId, movieId]],
			debug: !__IS_PROD__
		});

		this._removeMutation = createMutation<void, { groupId: number; movieId: number }>({
			key: ['group-movies', 'remove'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId }) => removeMovie(groupId, movieId),
			debug: !__IS_PROD__
		});
	}

	// === Add provider movie ===

	get addStatus(): PostStatus {
		return this._addProviderMutation.status;
	}

	get isAdding(): boolean {
		return this._addProviderMutation.isSubmitting;
	}

	get isAddSuccess(): boolean {
		return this._addProviderMutation.isSuccess;
	}

	get addError(): string | null {
		if (!this._addProviderMutation.error) return null;
		return this._extractErrorMessage(this._addProviderMutation.error, 'Ошибка добавления фильма');
	}

	async addMovie(groupId: number, data: AddMovieDto): Promise<GroupMovieResponseDto | null> {
		return untrack(() => this._addProviderMutation.mutate({ groupId, data }));
	}

	resetAdd(): void {
		this._addProviderMutation.reset();
	}

	// === Create custom movie ===

	get createStatus(): PostStatus {
		return this._createCustomMutation.status;
	}

	get isCreating(): boolean {
		return this._createCustomMutation.isSubmitting;
	}

	get isCreateSuccess(): boolean {
		return this._createCustomMutation.isSuccess;
	}

	get createError(): string | null {
		if (!this._createCustomMutation.error) return null;
		return this._extractErrorMessage(this._createCustomMutation.error, 'Ошибка создания фильма');
	}

	async createMovie(
		groupId: number,
		data: CreateCustomMovieDto
	): Promise<GroupMovieResponseDto | null> {
		return untrack(() => this._createCustomMutation.mutate({ groupId, data }));
	}

	resetCreate(): void {
		this._createCustomMutation.reset();
	}

	// === Update movie (unified) ===

	get updateStatus(): PostStatus {
		return this._updateMutation.status;
	}

	get isUpdating(): boolean {
		return this._updateMutation.isSubmitting;
	}

	get isUpdateSuccess(): boolean {
		return this._updateMutation.isSuccess;
	}

	get updateError(): string | null {
		if (!this._updateMutation.error) return null;
		return this._extractErrorMessage(this._updateMutation.error, 'Ошибка обновления фильма');
	}

	async updateMovie(
		groupId: number,
		movieId: number,
		data: GroupMovieUpdateDto
	): Promise<GroupMovieResponseDto | null> {
		return untrack(() => this._updateMutation.mutate({ groupId, movieId, data }));
	}

	resetUpdate(): void {
		this._updateMutation.reset();
	}

	// === Remove movie ===

	get removeStatus(): PostStatus {
		return this._removeMutation.status;
	}

	get isRemoving(): boolean {
		return this._removeMutation.isSubmitting;
	}

	get isRemoveSuccess(): boolean {
		return this._removeMutation.isSuccess;
	}

	get removeError(): string | null {
		if (!this._removeMutation.error) return null;
		return this._extractErrorMessage(this._removeMutation.error, 'Ошибка удаления фильма');
	}

	async removeMovie(groupId: number, movieId: number): Promise<void> {
		await untrack(() => this._removeMutation.mutate({ groupId, movieId }));
	}

	resetRemove(): void {
		this._removeMutation.reset();
	}

	// === Reset all ===

	resetForm(): void {
		this._addProviderMutation.reset();
		this._createCustomMutation.reset();
		this._updateMutation.reset();
		this._removeMutation.reset();
	}
}

export const groupMovieStore = new GroupMovieStore();
