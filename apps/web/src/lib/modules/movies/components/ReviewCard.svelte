<script lang="ts">
	import { Pencil, Trash2 } from '@lucide/svelte';
	import { Badge } from '@repo/ui';

	import type { ReviewResponseDto } from '$lib/api/generated/types';
	import { formatDate } from '$lib/utils';

	import StarRatingInput from './StarRatingInput.svelte';

	interface Props {
		review: ReviewResponseDto;
		isOwn: boolean;
		onEdit?: () => void;
		onDelete?: () => void;
	}

	let { review, isOwn, onEdit, onDelete }: Props = $props();
</script>

<div class="review-card" class:own={isOwn}>
	<div class="review-card__header">
		<div class="review-card__author">
			<span class="review-card__name">{review.userName ?? 'Пользователь'}</span>
			{#if isOwn}
				<Badge variant="primary" size="sm">Ваш отзыв</Badge>
			{/if}
		</div>
		<div class="review-card__meta">
			<span class="review-card__date">{formatDate(review.createdAt, 'short')}</span>
			{#if isOwn}
				{#if onEdit}
					<button
						type="button"
						class="review-card__icon-btn"
						onclick={onEdit}
						aria-label="Редактировать отзыв"
					>
						<Pencil size={14} />
					</button>
				{/if}
				{#if onDelete}
					<button
						type="button"
						class="review-card__icon-btn"
						onclick={onDelete}
						aria-label="Удалить отзыв"
					>
						<Trash2 size={14} />
					</button>
				{/if}
			{/if}
		</div>
	</div>

	<div class="review-card__rating">
		<StarRatingInput value={review.rating} size={20} disabled />
	</div>

	{#if review.text}
		<p class="review-card__text">{review.text}</p>
	{/if}
</div>

<style>
	.review-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
	}

	.review-card.own {
		background-color: color-mix(in srgb, var(--color-primary) 5%, var(--bg-secondary));
		border-left: 3px solid var(--color-primary);
	}

	.review-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.review-card__author {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.review-card__name {
		font-weight: var(--font-medium);
		font-size: var(--text-sm);
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.review-card__meta {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.review-card__date {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.review-card__icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1);
		background: transparent;
		border: none;
		color: var(--text-tertiary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	@media (hover: hover) {
		.review-card__icon-btn:hover:not(:disabled) {
			color: var(--text-primary);
			background-color: var(--bg-hover);
		}
	}

	.review-card__icon-btn:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.review-card__rating {
		display: flex;
	}

	.review-card__text {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-primary);
		line-height: var(--leading-relaxed);
		white-space: pre-wrap;
	}
</style>
