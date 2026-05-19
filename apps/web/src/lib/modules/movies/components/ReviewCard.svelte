<script lang="ts">
	import { Avatar, Badge, IconButton, toast } from '@repo/ui';
	import { Pencil, Trash2, SmilePlus } from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import type { ReviewReactionResponseDto } from '$lib/api/generated/types';
	import { formatDate } from '$lib/utils';

	import { ALLOWED_REACTIONS, type ReactionEmoji } from '../constants/reactions';
	import type { IProps } from './ReviewCard.types.svelte';
	import StarRatingInput from './StarRatingInput.svelte';
	import ReactionButton from './ReactionButton.svelte';
	import { groupMovieReviewsStore } from '../stores';
	import ReactionSheet from './ReactionSheet.svelte';

	let { review, isOwn, groupId, onEdit, onDelete }: IProps = $props();

	let sheetOpen = $state(false);
	const isThisSubmitting = $derived(groupMovieReviewsStore.isReactionSubmittingFor(review.id));

	const reactions = $derived(review.reactions ?? []);
	const ownReaction = $derived(reactions.find((r) => r.isOwn));

	const aggregated = $derived.by(() => {
		const record: Record<string, number> = {};
		for (const r of reactions) {
			record[r.emoji] = (record[r.emoji] ?? 0) + 1;
		}
		return record;
	});

	const activeEmojis = $derived(ALLOWED_REACTIONS.filter((emoji) => (aggregated[emoji] ?? 0) > 0));

	const reactionsByEmoji = $derived.by(() => {
		const map = new SvelteMap<string, ReviewReactionResponseDto[]>();
		for (const r of reactions) {
			const list = map.get(r.emoji) ?? [];
			list.push(r);
			map.set(r.emoji, list);
		}
		return map;
	});

	const handleReactionToggle = async (emoji: ReactionEmoji) => {
		if (isOwn || isThisSubmitting) return;

		if (ownReaction?.emoji === emoji) {
			await groupMovieReviewsStore.removeReaction(groupId, review.groupMovieId, review.id);
			if (!groupMovieReviewsStore.isRemoveReactionSuccess) {
				toast.error(groupMovieReviewsStore.removeReactionError ?? 'Ошибка удаления реакции');
			}
		} else {
			if (ownReaction) {
				await groupMovieReviewsStore.removeReaction(groupId, review.groupMovieId, review.id);
				if (!groupMovieReviewsStore.isRemoveReactionSuccess) {
					toast.error(groupMovieReviewsStore.removeReactionError ?? 'Ошибка удаления реакции');
					return;
				}
			}
			const result = await groupMovieReviewsStore.addReaction(
				groupId,
				review.groupMovieId,
				review.id,
				{ emoji }
			);
			if (!result) {
				toast.error(groupMovieReviewsStore.addReactionError ?? 'Ошибка добавления реакции');
			}
		}
	};
</script>

<div class="review-card" class:own={isOwn}>
	<div class="review-card__header">
		<div class="review-card__author">
			<Avatar src={review.userAvatar} name={review.userName} size="sm" />
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

	{#if !isOwn || reactions.length > 0}
		<div class="review-card__reactions">
			{#if reactions.length > 0}
				<div class="review-card__reaction-buttons">
					{#each activeEmojis as emoji (emoji)}
						{@const emojiReactions = reactionsByEmoji.get(emoji) ?? []}
						{@const isActive = ownReaction?.emoji === emoji}
						{#if reactions.length <= 3}
							<ReactionButton
								{emoji}
								reactions={emojiReactions}
								{isActive}
								disabled={isThisSubmitting}
								onClick={isOwn ? () => (sheetOpen = true) : () => handleReactionToggle(emoji)}
								variant="avatars"
								ariaLabel={isOwn ? 'Посмотреть реакции' : undefined}
							/>
						{:else}
							<ReactionButton
								{emoji}
								count={aggregated[emoji]}
								{isActive}
								disabled={isOwn || isThisSubmitting}
								onClick={() => handleReactionToggle(emoji)}
								variant="count"
							/>
						{/if}
					{/each}
				</div>
			{/if}

			{#if !isOwn || reactions.length > 3}
				<div class="review-card__reactions-action">
					<IconButton
						Icon={SmilePlus}
						label={isOwn ? 'Посмотреть реакции' : 'Добавить реакцию'}
						size="sm"
						variant="ghost"
						onclick={() => (sheetOpen = true)}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>

<ReactionSheet
	bind:open={sheetOpen}
	{reactions}
	isOwnReview={isOwn}
	onSelect={handleReactionToggle}
/>

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
		overflow-wrap: anywhere;
	}

	.review-card__reactions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.review-card__reactions-action {
		margin-left: auto;
	}
</style>
