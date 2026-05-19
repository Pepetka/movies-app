import { untrack } from 'svelte';

import type {
	ReviewResponseDto,
	CreateReviewDto,
	UpdateReviewDto,
	CreateReviewReactionDto,
	ReviewReactionResponseDto
} from '$lib/api/generated/types';
import { createMutation, type MutationResult, type PostStatus } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import { createReaction, deleteReaction } from '../api/reactions.api';
import { createReview, updateReview, deleteReview } from '../api';

interface ReviewParams {
	groupId: number;
	movieId: number;
}

class GroupMovieReviewsStore extends BaseStore {
	private readonly _createMutation: MutationResult<
		ReviewResponseDto,
		ReviewParams & { data: CreateReviewDto }
	>;
	private readonly _updateMutation: MutationResult<
		ReviewResponseDto,
		ReviewParams & { reviewId: number; data: UpdateReviewDto }
	>;
	private readonly _deleteMutation: MutationResult<void, ReviewParams & { reviewId: number }>;
	private readonly _createReactionMutation: MutationResult<
		ReviewReactionResponseDto,
		ReviewParams & { reviewId: number; data: CreateReviewReactionDto }
	>;
	private readonly _deleteReactionMutation: MutationResult<
		void,
		ReviewParams & { reviewId: number }
	>;

	private _addingReactionIds = $state<number[]>([]);
	private _removingReactionIds = $state<number[]>([]);

	constructor() {
		super();

		this._createMutation = createMutation<
			ReviewResponseDto,
			ReviewParams & { data: CreateReviewDto }
		>({
			key: ['group-movie-reviews', 'create'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, data }) => createReview(groupId, movieId, data),
			invalidateKeys: (_, { groupId, movieId }) => [
				['group-movie', groupId, movieId],
				['group-movies', groupId]
			],
			debug: !__IS_PROD__
		});

		this._updateMutation = createMutation<
			ReviewResponseDto,
			ReviewParams & { reviewId: number; data: UpdateReviewDto }
		>({
			key: ['group-movie-reviews', 'update'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, reviewId, data }) =>
				updateReview(groupId, movieId, reviewId, data),
			invalidateKeys: (_, { groupId, movieId }) => [
				['group-movie', groupId, movieId],
				['group-movies', groupId]
			],
			debug: !__IS_PROD__
		});

		this._deleteMutation = createMutation<void, ReviewParams & { reviewId: number }>({
			key: ['group-movie-reviews', 'delete'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, reviewId }) => deleteReview(groupId, movieId, reviewId),
			invalidateKeys: (_, { groupId, movieId }) => [
				['group-movie', groupId, movieId],
				['group-movies', groupId]
			],
			debug: !__IS_PROD__
		});

		this._createReactionMutation = createMutation<
			ReviewReactionResponseDto,
			ReviewParams & { reviewId: number; data: CreateReviewReactionDto }
		>({
			key: ['group-movie-reviews', 'reaction', 'create'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, reviewId, data }) =>
				createReaction(groupId, movieId, reviewId, data),
			invalidateKeys: (_, { groupId, movieId }) => [
				['group-movie', groupId, movieId],
				['group-movies', groupId]
			],
			debug: !__IS_PROD__
		});

		this._deleteReactionMutation = createMutation<void, ReviewParams & { reviewId: number }>({
			key: ['group-movie-reviews', 'reaction', 'delete'],
			tags: ['group-movies'],
			mutator: ({ groupId, movieId, reviewId }) => deleteReaction(groupId, movieId, reviewId),
			invalidateKeys: (_, { groupId, movieId }) => [
				['group-movie', groupId, movieId],
				['group-movies', groupId]
			],
			debug: !__IS_PROD__
		});
	}

	// === Create ===

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
		return this._extractErrorMessage(this._createMutation.error, 'Ошибка отправки отзыва');
	}

	// === Update ===

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
		return this._extractErrorMessage(this._updateMutation.error, 'Ошибка обновления отзыва');
	}

	// === Delete ===

	get deleteStatus(): PostStatus {
		return this._deleteMutation.status;
	}

	get isDeleting(): boolean {
		return this._deleteMutation.isSubmitting;
	}

	get isDeleteSuccess(): boolean {
		return this._deleteMutation.isSuccess;
	}

	get deleteError(): string | null {
		if (!this._deleteMutation.error) return null;
		return this._extractErrorMessage(this._deleteMutation.error, 'Ошибка удаления отзыва');
	}

	// === Reaction Create ===

	isAddingReactionFor(reviewId: number): boolean {
		return this._addingReactionIds.includes(reviewId);
	}

	// === Reaction Delete ===

	isRemovingReactionFor(reviewId: number): boolean {
		return this._removingReactionIds.includes(reviewId);
	}

	// === Actions ===

	async createReview(
		groupId: number,
		movieId: number,
		data: CreateReviewDto
	): Promise<ReviewResponseDto | null> {
		return untrack(() => this._createMutation.mutate({ groupId, movieId, data }));
	}

	async updateReview(
		groupId: number,
		movieId: number,
		reviewId: number,
		data: UpdateReviewDto
	): Promise<ReviewResponseDto | null> {
		return untrack(() => this._updateMutation.mutate({ groupId, movieId, reviewId, data }));
	}

	async deleteReview(groupId: number, movieId: number, reviewId: number): Promise<void> {
		await untrack(() => this._deleteMutation.mutate({ groupId, movieId, reviewId }));
	}

	async addReaction(
		groupId: number,
		movieId: number,
		reviewId: number,
		data: CreateReviewReactionDto
	): Promise<{ success: boolean; data?: ReviewReactionResponseDto; error?: string }> {
		this._addingReactionIds = [...this._addingReactionIds, reviewId];
		try {
			const result = await untrack(() =>
				this._createReactionMutation.mutate({ groupId, movieId, reviewId, data })
			);
			if (result) {
				return { success: true, data: result };
			}
			return {
				success: false,
				error: this._extractErrorMessage(
					this._createReactionMutation.error,
					'Ошибка добавления реакции'
				)
			};
		} finally {
			this._addingReactionIds = this._addingReactionIds.filter((id) => id !== reviewId);
		}
	}

	async removeReaction(
		groupId: number,
		movieId: number,
		reviewId: number
	): Promise<{ success: boolean; error?: string }> {
		this._removingReactionIds = [...this._removingReactionIds, reviewId];
		try {
			await untrack(() => this._deleteReactionMutation.mutate({ groupId, movieId, reviewId }));
			if (this._deleteReactionMutation.error) {
				return {
					success: false,
					error: this._extractErrorMessage(
						this._deleteReactionMutation.error,
						'Ошибка удаления реакции'
					)
				};
			}
			return { success: true };
		} finally {
			this._removingReactionIds = this._removingReactionIds.filter((id) => id !== reviewId);
		}
	}

	reset(): void {
		this._createMutation.reset();
		this._updateMutation.reset();
		this._deleteMutation.reset();
		this._createReactionMutation.reset();
		this._deleteReactionMutation.reset();
	}
}

export const groupMovieReviewsStore = new GroupMovieReviewsStore();
