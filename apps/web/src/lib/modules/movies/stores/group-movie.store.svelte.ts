import type {
	AddMovieDto,
	CreateCustomMovieDto,
	CustomMovieResponseDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto,
	UpdateCustomMovieDto
} from '$lib/api/generated/types';
import { createMutation, type MutationResult, type PostStatus } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	addGroupMovie,
	createCustomMovie,
	removeCustomMovie,
	removeGroupMovie,
	updateCustomMovie,
	updateMovieStatus
} from '../api';

class GroupMovieStore extends BaseStore {
	private readonly _addMutation: MutationResult<
		GroupMovieResponseDto,
		{ groupId: number; data: AddMovieDto }
	>;
	private readonly _createMutation: MutationResult<
		CustomMovieResponseDto,
		{ groupId: number; data: CreateCustomMovieDto }
	>;
	private readonly _updateStatusMutation: MutationResult<
		GroupMovieResponseDto,
		{ groupId: number; movieId: number; data: GroupMovieUpdateDto }
	>;
	private readonly _updateCustomMutation: MutationResult<
		CustomMovieResponseDto,
		{ groupId: number; movieId: number; data: UpdateCustomMovieDto }
	>;
	private readonly _removeMutation: MutationResult<
		void,
		{ groupId: number; movieId: number; isCustom: boolean }
	>;

	constructor() {
		super();

		this._addMutation = createMutation<
			GroupMovieResponseDto,
			{ groupId: number; data: AddMovieDto }
		>({
			key: ['group-movies', 'add'],
			tags: ['group-movies'],
			mutator: ({ groupId, data }) => addGroupMovie(groupId, data),
			debug: !__IS_PROD__
		});

		this._createMutation = createMutation<
			CustomMovieResponseDto,
			{ groupId: number; data: CreateCustomMovieDto }
		>({
			key: ['group-movies', 'create'],
			tags: ['group-movies'],
			mutator: ({ groupId, data }) => createCustomMovie(groupId, data),
			debug: !__IS_PROD__
		});

		this._updateStatusMutation = createMutation<
			GroupMovieResponseDto,
			{ groupId: number; movieId: number; data: GroupMovieUpdateDto }
		>({
			key: ['group-movies', 'update-status'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, data }) => updateMovieStatus(groupId, movieId, data),
			debug: !__IS_PROD__
		});

		this._updateCustomMutation = createMutation<
			CustomMovieResponseDto,
			{ groupId: number; movieId: number; data: UpdateCustomMovieDto }
		>({
			key: ['group-movies', 'update-custom'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, data }) => updateCustomMovie(groupId, movieId, data),
			debug: !__IS_PROD__
		});

		this._removeMutation = createMutation<
			void,
			{ groupId: number; movieId: number; isCustom: boolean }
		>({
			key: ['group-movies', 'remove'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, isCustom }) =>
				isCustom ? removeCustomMovie(groupId, movieId) : removeGroupMovie(groupId, movieId),
			debug: !__IS_PROD__
		});
	}

	// === Add provider movie ===

	get addStatus(): PostStatus {
		return this._addMutation.status;
	}

	get isAdding(): boolean {
		return this._addMutation.isSubmitting;
	}

	get isAddSuccess(): boolean {
		return this._addMutation.isSuccess;
	}

	get addError(): string | null {
		if (!this._addMutation.error) return null;
		return this._extractErrorMessage(this._addMutation.error, 'Ошибка добавления фильма');
	}

	async addMovie(groupId: number, data: AddMovieDto): Promise<GroupMovieResponseDto | null> {
		return this._addMutation.mutate({ groupId, data });
	}

	resetAdd(): void {
		this._addMutation.reset();
	}

	// === Create custom movie ===

	get createStatus(): PostStatus {
		return this._createMutation.status;
	}

	get isCreating(): boolean {
		return this._createMutation.isSubmitting;
	}

	get isCreateSuccess(): boolean {
		return this._createMutation.isSuccess;
	}

	get createError(): string | null {
		if (!this._createMutation.error) return null;
		return this._extractErrorMessage(this._createMutation.error, 'Ошибка создания фильма');
	}

	async createMovie(
		groupId: number,
		data: CreateCustomMovieDto
	): Promise<CustomMovieResponseDto | null> {
		return this._createMutation.mutate({ groupId, data });
	}

	resetCreate(): void {
		this._createMutation.reset();
	}

	// === Update status ===

	get updateStatusStatus(): PostStatus {
		return this._updateStatusMutation.status;
	}

	get isUpdatingStatus(): boolean {
		return this._updateStatusMutation.isSubmitting;
	}

	get isUpdateStatusSuccess(): boolean {
		return this._updateStatusMutation.isSuccess;
	}

	get updateStatusError(): string | null {
		if (!this._updateStatusMutation.error) return null;
		return this._extractErrorMessage(this._updateStatusMutation.error, 'Ошибка обновления статуса');
	}

	async updateStatus(
		groupId: number,
		movieId: number,
		data: GroupMovieUpdateDto
	): Promise<GroupMovieResponseDto | null> {
		return this._updateStatusMutation.mutate({ groupId, movieId, data });
	}

	resetUpdateStatus(): void {
		this._updateStatusMutation.reset();
	}

	// === Update custom movie ===

	get updateCustomStatus(): PostStatus {
		return this._updateCustomMutation.status;
	}

	get isUpdatingCustom(): boolean {
		return this._updateCustomMutation.isSubmitting;
	}

	get isUpdateCustomSuccess(): boolean {
		return this._updateCustomMutation.isSuccess;
	}

	get updateCustomError(): string | null {
		if (!this._updateCustomMutation.error) return null;
		return this._extractErrorMessage(this._updateCustomMutation.error, 'Ошибка обновления фильма');
	}

	async updateCustom(
		groupId: number,
		movieId: number,
		data: UpdateCustomMovieDto
	): Promise<CustomMovieResponseDto | null> {
		return this._updateCustomMutation.mutate({ groupId, movieId, data });
	}

	resetUpdateCustom(): void {
		this._updateCustomMutation.reset();
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

	async removeMovie(groupId: number, movieId: number, isCustom: boolean): Promise<void> {
		await this._removeMutation.mutate({ groupId, movieId, isCustom });
	}

	resetRemove(): void {
		this._removeMutation.reset();
	}

	// === Reset all ===

	resetForm(): void {
		this._addMutation.reset();
		this._createMutation.reset();
		this._updateStatusMutation.reset();
		this._updateCustomMutation.reset();
		this._removeMutation.reset();
	}
}

export const groupMovieStore = new GroupMovieStore();
