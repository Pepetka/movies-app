<script lang="ts">
	import type { IProps } from './Card.types.svelte';

	const {
		variant = 'elevated',
		size = 'md',
		interactive = false,
		fullWidth = false,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const tag = $derived(interactive ? 'article' : 'div');

	let cardElement = $state.raw<HTMLElement | null>(null);

	const handleKeydown = (e: KeyboardEvent) => {
		if (!interactive) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			cardElement?.click();
		}
	};
</script>

<svelte:element
	this={tag}
	bind:this={cardElement}
	class={[
		'ui-card',
		variant,
		size,
		interactive && 'interactive',
		fullWidth && 'full-width',
		className
	]}
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
	onkeydown={interactive ? handleKeydown : undefined}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>

<style>
	.ui-card {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-xl);
		background-color: var(--bg-primary);
		transition:
			background-color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-card.full-width {
		width: 100%;
	}

	/* Sizes */
	.ui-card.sm {
		padding: var(--card-sm-padding);
	}

	.ui-card.md {
		padding: var(--card-md-padding);
	}

	.ui-card.lg {
		padding: var(--card-lg-padding);
	}

	/* Variants */
	.ui-card.elevated {
		border: none;
		box-shadow: var(--shadow-md);
	}

	@media (hover: hover) {
		.ui-card.elevated.interactive:hover {
			box-shadow: var(--shadow-lg);
		}
	}

	.ui-card.elevated.interactive:active {
		box-shadow: var(--shadow-md);
		transform: scale(0.99);
	}

	.ui-card.outlined {
		border: var(--border-width-thin) solid var(--border-primary);
		box-shadow: none;
	}

	@media (hover: hover) {
		.ui-card.outlined.interactive:hover {
			border-color: var(--border-secondary);
			background-color: var(--bg-secondary);
		}
	}

	.ui-card.outlined.interactive:active {
		transform: scale(0.99);
	}

	.ui-card.filled {
		border: none;
		box-shadow: none;
		background-color: var(--bg-secondary);
	}

	@media (hover: hover) {
		.ui-card.filled.interactive:hover {
			background-color: var(--bg-tertiary);
		}
	}

	.ui-card.filled.interactive:active {
		transform: scale(0.99);
	}

	/* Interactive */
	.ui-card.interactive {
		cursor: pointer;
	}

	.ui-card.interactive:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
