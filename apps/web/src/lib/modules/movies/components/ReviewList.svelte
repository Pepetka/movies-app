<script lang="ts">
	import { Button, Sheet, Skeleton, toast } from '@repo/ui';
	import { MessageSquare } from '@lucide/svelte';

	import type { ReviewResponseDto } from '$lib/api/generated/types';

	import {
		EMPTY_REVIEW_FORM,
		reviewFormToCreateDto,
		reviewFormToUpdateDto,
		reviewFormFromEntity,
		type ReviewFormData
	} from '../validation';
	import { groupMovieReviewsStore } from '../stores';
	import ReviewCard from './ReviewCard.svelte';
	import ReviewForm from './ReviewForm.svelte';
	import type { MovieStatus } from '../types';

	interface Props {
		groupId: number;
		movieId: number;
		status: MovieStatus;
		reviews: ReviewResponseDto[];
		myReview: ReviewResponseDto | null;
		isLoading: boolean;
	}

	let { groupId, movieId, status, reviews, myReview, isLoading }: Props = $props();

	let isEditing = $state(false);
	let showDeleteSheet = $state(false);
	let editForm = $state<ReviewFormData>({ ...EMPTY_REVIEW_FORM });

	const otherReviews = $derived.by(() => {
		return reviews.filter((r) => r.id !== myReview?.id);
	});

	const hasMyReview = $derived(myReview !== null);

	const handleCreate = async (form: ReviewFormData) => {
		await groupMovieReviewsStore.createReview(groupId, movieId, reviewFormToCreateDto(form));
		if (groupMovieReviewsStore.isCreateSuccess) {
			toast.success('Отзыв отправлен');
		} else {
			toast.error(groupMovieReviewsStore.createError ?? 'Ошибка отправки отзыва');
		}
	};

	const handleUpdate = async (form: ReviewFormData) => {
		if (!myReview) return;
		await groupMovieReviewsStore.updateReview(
			groupId,
			movieId,
			myReview.id,
			reviewFormToUpdateDto(form)
		);
		if (groupMovieReviewsStore.isUpdateSuccess) {
			toast.success('Отзыв обновлён');
			isEditing = false;
		} else {
			toast.error(groupMovieReviewsStore.updateError ?? 'Ошибка обновления отзыва');
		}
	};

	const openDeleteSheet = () => {
		showDeleteSheet = true;
	};

	const closeDeleteSheet = () => {
		showDeleteSheet = false;
	};

	const handleDelete = async () => {
		if (!myReview) return;
		await groupMovieReviewsStore.deleteReview(groupId, movieId, myReview.id);
		if (groupMovieReviewsStore.isDeleteSuccess) {
			toast.success('Отзыв удалён');
			closeDeleteSheet();
			isEditing = false;
		} else {
			toast.error(groupMovieReviewsStore.deleteError ?? 'Ошибка удаления отзыва');
		}
	};

	const startEdit = () => {
		if (myReview) {
			editForm = reviewFormFromEntity(myReview);
			isEditing = true;
		}
	};

	const cancelEdit = () => {
		isEditing = false;
		editForm = { ...EMPTY_REVIEW_FORM };
	};

	$effect(() => {
		return () => groupMovieReviewsStore.reset();
	});
</script>

<div class="review-list">
	{#if isLoading}
		<div class="review-list__skeletons">
			{#each Array(3) as _, i (i)}
				<div class="review-list__skeleton">
					<Skeleton height={80} />
				</div>
			{/each}
		</div>
	{:else}
		{#if status === 'watched'}
			{#if !hasMyReview}
				<ReviewForm
					mode="create"
					onSubmit={handleCreate}
					isSubmitting={groupMovieReviewsStore.isCreating}
				/>
			{:else if isEditing}
				<ReviewForm
					form={editForm}
					mode="edit"
					onSubmit={handleUpdate}
					onCancel={cancelEdit}
					isSubmitting={groupMovieReviewsStore.isUpdating}
				/>
			{:else if myReview}
				<ReviewCard review={myReview} isOwn={true} onEdit={startEdit} onDelete={openDeleteSheet} />
			{/if}
		{:else if myReview}
			<ReviewCard review={myReview} isOwn={true} onEdit={startEdit} onDelete={openDeleteSheet} />
		{/if}

		{#if otherReviews.length > 0}
			<div class="review-list__others">
				{#each otherReviews as review (review.id)}
					<ReviewCard {review} isOwn={false} onEdit={() => {}} onDelete={() => {}} />
				{/each}
			</div>
		{:else if status === 'watched' && !hasMyReview}
			<div class="review-list__empty">
				<MessageSquare size={32} />
				<p>Пока нет отзывов. Будьте первым!</p>
			</div>
		{/if}
	{/if}
</div>

<Sheet bind:open={showDeleteSheet} size="sm">
	{#snippet header()}
		<h2>Удалить отзыв?</h2>
	{/snippet}

	<p class="delete-text">Отзыв будет удалён безвозвратно.</p>

	{#snippet footer()}
		<Button
			variant="secondary"
			onclick={closeDeleteSheet}
			disabled={groupMovieReviewsStore.isDeleting}
		>
			Отмена
		</Button>
		<Button variant="danger" onclick={handleDelete} loading={groupMovieReviewsStore.isDeleting}>
			Удалить
		</Button>
	{/snippet}
</Sheet>

<style>
	.review-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.review-list__skeletons {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.review-list__skeleton {
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.review-list__others {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.review-list__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-6);
		color: var(--text-tertiary);
		font-size: var(--text-sm);
		text-align: center;
	}

	.delete-text {
		margin: 0;
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
	}
</style>
