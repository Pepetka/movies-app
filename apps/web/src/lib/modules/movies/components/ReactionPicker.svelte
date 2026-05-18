<script lang="ts">
	import type { IProps } from './ReactionPicker.types.svelte';
	import { ALLOWED_REACTIONS } from '../constants/reactions';

	let { ownEmoji, disabled = false, onSelect }: IProps = $props();

	const handleClick = (emoji: string) => {
		if (disabled) return;
		onSelect(emoji);
	};
</script>

<div class="reaction-picker" role="group" aria-label="Выбор реакции">
	{#each ALLOWED_REACTIONS as emoji (emoji)}
		{@const isActive = ownEmoji === emoji}
		<button
			type="button"
			class="reaction-picker__chip"
			class:active={isActive}
			{disabled}
			onclick={() => handleClick(emoji)}
			aria-pressed={isActive}
			aria-label={isActive ? `Ваша реакция ${emoji}` : `Реакция ${emoji}`}
		>
			<span class="reaction-picker__emoji">{emoji}</span>
		</button>
	{/each}
</div>

<style>
	.reaction-picker {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-2);
	}

	.reaction-picker__chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 4px 8px;
		background-color: var(--bg-tertiary);
		border: 1px solid transparent;
		border-radius: var(--radius-xl);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			transform 0.1s ease;
	}

	.reaction-picker__chip:disabled {
		cursor: not-allowed;
	}

	.reaction-picker__chip.active {
		background-color: color-mix(in srgb, var(--color-primary) 15%, var(--bg-tertiary));
		border-color: var(--color-primary);
	}

	@media (hover: hover) {
		.reaction-picker__chip:hover:not(:disabled) {
			background-color: var(--bg-hover);
		}
	}

	.reaction-picker__chip:active:not(:disabled) {
		transform: scale(0.92);
	}

	.reaction-picker__emoji {
		line-height: 1;
		font-size: 18px;
	}
</style>
