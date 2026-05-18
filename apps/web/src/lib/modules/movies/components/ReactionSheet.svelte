<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Sheet } from '@repo/ui';

	import ReactionParticipants from './ReactionParticipants.svelte';
	import type { Props } from './ReactionSheet.types.svelte';
	import ReactionPicker from './ReactionPicker.svelte';

	let { open = $bindable(false), reactions, isOwnReview, onSelect }: Props = $props();

	const ownEmoji = $derived(reactions.find((r) => r.isOwn)?.emoji);

	const handleSelect = (emoji: string) => {
		onSelect(emoji);
		open = false;
	};
</script>

<Sheet bind:open size="sm" closeOnOverlay closeOnEscape>
	{#snippet header(close)}
		<div class="reaction-sheet__header">
			<h3 class="reaction-sheet__title">Реакции</h3>
			<button type="button" class="reaction-sheet__close" onclick={close} aria-label="Закрыть">
				<X size={20} />
			</button>
		</div>
	{/snippet}

	{#snippet drawerHeader()}
		<h3 class="reaction-sheet__title">Реакции</h3>
	{/snippet}

	<div class="reaction-sheet__content">
		{#if !isOwnReview}
			<ReactionPicker {ownEmoji} disabled={isOwnReview} onSelect={handleSelect} />
		{/if}
		{#if reactions.length > 0}
			{#if !isOwnReview}
				<div class="reaction-sheet__divider"></div>
			{/if}
			<ReactionParticipants {reactions} />
		{/if}
	</div>
</Sheet>

<style>
	.reaction-sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.reaction-sheet__title {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
	}

	.reaction-sheet__close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-8);
		height: var(--space-8);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--text-tertiary);
		font-size: var(--text-lg);
		cursor: pointer;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	@media (hover: hover) {
		.reaction-sheet__close:hover {
			background-color: var(--bg-hover);
			color: var(--text-primary);
		}
	}

	.reaction-sheet__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.reaction-sheet__divider {
		height: 1px;
		background-color: var(--border-primary);
	}
</style>
