<script lang="ts">
	import { Avatar, Badge, IconButton, toast } from '@repo/ui';
	import { Pencil, Trash2, SmilePlus } from '@lucide/svelte';

	import type { ReviewResponseDto, CreateReviewReactionDto } from '$lib/api/generated/types';
	import { formatDate } from '$lib/utils';

	import { ALLOWED_REACTIONS } from '../constants/reactions';
	import StarRatingInput from './StarRatingInput.svelte';
	import { groupMovieReviewsStore } from '../stores';
	import ReactionSheet from './ReactionSheet.svelte';

	interface Props {
		review: ReviewResponseDto;
		isOwn: boolean;
		groupId: number;
		onEdit?: () => void;
		onDelete?: () => void;
	}

	let { review, isOwn, groupId, onEdit, onDelete }: Props = $props();

	let sheetOpen = $state(false);
	let isSubmitting = $state(false);

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

	const handleReactionToggle = async (emoji: string) => {
		if (isOwn || isSubmitting) return;
		isSubmitting = true;
		try {
			if (ownReaction?.emoji === emoji) {
				await groupMovieReviewsStore.removeReaction(groupId, review.groupMovieId, review.id);
				if (groupMovieReviewsStore.removeReactionError) {
					toast.error(groupMovieReviewsStore.removeReactionError);
					return;
				}
			} else {
				if (ownReaction) {
					await groupMovieReviewsStore.removeReaction(groupId, review.groupMovieId, review.id);
					if (groupMovieReviewsStore.removeReactionError) {
						toast.error(groupMovieReviewsStore.removeReactionError);
						return;
					}
				}
				const dto: CreateReviewReactionDto = { emoji };
				await groupMovieReviewsStore.addReaction(groupId, review.groupMovieId, review.id, dto);
				if (groupMovieReviewsStore.addReactionError) {
					toast.error(groupMovieReviewsStore.addReactionError);
				}
			}
		} finally {
			isSubmitting = false;
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
				{#if reactions.length <= 3}
					<div class="review-card__reaction-groups">
						{#each activeEmojis as emoji (emoji)}
							{@const emojiReactions = reactions.filter((r) => r.emoji === emoji)}
							{#if isOwn}
								<button
									type="button"
									class="review-card__reaction-group"
									disabled={isSubmitting}
									onclick={() => (sheetOpen = true)}
									aria-label="Посмотреть реакции"
								>
									<span class="review-card__group-emoji">{emoji}</span>
									<div class="review-card__avatar-stack">
										{#each emojiReactions as reaction, i (reaction.id)}
											<span
												class="review-card__avatar-wrap"
												style:z-index={emojiReactions.length - i}
											>
												<Avatar src={reaction.userAvatar} name={reaction.userName} size="xxs" />
											</span>
										{/each}
									</div>
								</button>
							{:else}
								<button
									type="button"
									class="review-card__reaction-group"
									class:active={ownReaction?.emoji === emoji}
									disabled={isSubmitting}
									onclick={() => handleReactionToggle(emoji)}
									aria-label={ownReaction?.emoji === emoji
										? `Убрать реакцию ${emoji}`
										: `Добавить реакцию ${emoji}`}
								>
									<span class="review-card__group-emoji">{emoji}</span>
									<div class="review-card__avatar-stack">
										{#each emojiReactions as reaction, i (reaction.id)}
											<span
												class="review-card__avatar-wrap"
												style:z-index={emojiReactions.length - i}
											>
												<Avatar src={reaction.userAvatar} name={reaction.userName} size="xxs" />
											</span>
										{/each}
									</div>
								</button>
							{/if}
						{/each}
					</div>
				{:else}
					<div class="review-card__chips">
						{#each activeEmojis as emoji (emoji)}
							{@const count = aggregated[emoji]}
							{@const isActive = ownReaction?.emoji === emoji}
							<button
								type="button"
								class="review-card__chip"
								class:active={isActive}
								disabled={isOwn || isSubmitting}
								onclick={() => handleReactionToggle(emoji)}
								aria-label={isActive ? `Убрать реакцию ${emoji}` : `Добавить реакцию ${emoji}`}
							>
								<span class="review-card__chip-emoji">{emoji}</span>
								<span class="review-card__chip-count">{count}</span>
							</button>
						{/each}
					</div>
				{/if}
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

	.review-card__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		min-width: 0;
	}

	.review-card__chip {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 1px 4px;
		background-color: var(--bg-tertiary);
		border: 1px solid transparent;
		border-radius: var(--radius-xl);
		font-size: var(--text-xs);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.review-card__chip:disabled {
		cursor: not-allowed;
	}

	.review-card__chip.active {
		background-color: color-mix(in srgb, var(--color-primary) 15%, var(--bg-tertiary));
		border-color: var(--color-primary);
	}

	@media (hover: hover) {
		.review-card__chip:hover:not(:disabled) {
			background-color: var(--bg-hover);
		}
	}

	.review-card__chip-emoji {
		line-height: 1;
		font-size: 18px;
	}

	.review-card__chip-count {
		font-size: 10px;
		color: var(--text-secondary);
		font-weight: var(--font-medium);
	}

	.review-card__reaction-groups {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.review-card__reaction-group {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 1px 4px;
		background-color: var(--bg-tertiary);
		border: 1px solid transparent;
		border-radius: var(--radius-xl);
		font-size: var(--text-xs);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.review-card__reaction-group:disabled {
		cursor: not-allowed;
	}

	.review-card__reaction-group.active {
		background-color: color-mix(in srgb, var(--color-primary) 15%, var(--bg-tertiary));
		border-color: var(--color-primary);
	}

	@media (hover: hover) {
		.review-card__reaction-group:hover:not(:disabled) {
			background-color: var(--bg-hover);
		}
	}

	.review-card__group-emoji {
		line-height: 1;
		font-size: 18px;
	}

	.review-card__avatar-stack {
		display: flex;
		align-items: center;
	}

	.review-card__avatar-wrap {
		display: flex;
		width: 16px;
		height: 16px;
		margin-left: -5px;
		border-radius: var(--radius-full);
		box-shadow: 0 0 0 2px var(--bg-secondary);
		overflow: hidden;
	}

	.review-card__avatar-wrap:first-child {
		margin-left: 0;
	}

	.review-card__reactions-action {
		margin-left: auto;
	}
</style>
