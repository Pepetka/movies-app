<script lang="ts">
	import { Avatar } from '@repo/ui';

	import type { ReviewReactionResponseDto } from '$lib/api/generated/types';

	import type { ReactionEmoji } from '../constants/reactions';

	interface Props {
		emoji: ReactionEmoji;
		reactions?: ReviewReactionResponseDto[];
		count?: number;
		isActive?: boolean;
		disabled?: boolean;
		onClick: () => void;
		variant: 'avatars' | 'count';
		ariaLabel?: string;
	}

	let { emoji, reactions, count, isActive, disabled, onClick, variant, ariaLabel }: Props =
		$props();
</script>

<button
	type="button"
	class="reaction-button"
	class:active={isActive}
	{disabled}
	onclick={onClick}
	aria-label={ariaLabel ?? (isActive ? `Убрать реакцию ${emoji}` : `Добавить реакцию ${emoji}`)}
>
	<span class="reaction-button__emoji">{emoji}</span>
	{#if variant === 'avatars' && reactions}
		<span class="reaction-button__avatars">
			{#each reactions as reaction, i (reaction.id)}
				<span class="reaction-button__avatar-wrap" style:z-index={reactions.length - i}>
					<Avatar src={reaction.userAvatar} name={reaction.userName} size="xxs" />
				</span>
			{/each}
		</span>
	{:else if variant === 'count' && count !== undefined}
		<span class="reaction-button__count">{count}</span>
	{/if}
</button>

<style>
	.reaction-button {
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

	.reaction-button:disabled {
		cursor: not-allowed;
	}

	.reaction-button.active {
		background-color: color-mix(in srgb, var(--color-primary) 15%, var(--bg-tertiary));
		border-color: var(--color-primary);
	}

	@media (hover: hover) {
		.reaction-button:hover:not(:disabled) {
			background-color: var(--bg-hover);
		}
	}

	.reaction-button__emoji {
		line-height: 1;
		font-size: 18px;
	}

	.reaction-button__avatars {
		display: flex;
		align-items: center;
	}

	.reaction-button__avatar-wrap {
		display: flex;
		width: 16px;
		height: 16px;
		margin-left: -5px;
		border-radius: var(--radius-full);
		box-shadow: 0 0 0 2px var(--bg-secondary);
		overflow: hidden;
	}

	.reaction-button__avatar-wrap:first-child {
		margin-left: 0;
	}

	.reaction-button__count {
		font-size: 10px;
		color: var(--text-secondary);
		font-weight: var(--font-medium);
	}
</style>
