<script lang="ts">
	import type { IProps } from './Card.types.svelte';

	const {
		variant = 'elevated',
		size = 'md',
		interactive = false,
		fullWidth = false,
		class: className,
		children,
		header,
		footer,
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
	{#if header}
		<div class="ui-card-header">
			{@render header()}
		</div>
	{/if}

	{#if children}
		<div class="ui-card-body">
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div class="ui-card-footer">
			{@render footer()}
		</div>
	{/if}
</svelte:element>

<style>
	.ui-card {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-xl);
		background-color: var(--bg-primary);
		overflow: hidden;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-card.full-width {
		width: 100%;
	}

	/* Sizes - affect section padding */
	.ui-card.sm .ui-card-header,
	.ui-card.sm .ui-card-body,
	.ui-card.sm .ui-card-footer {
		padding: var(--space-3) var(--space-4);
	}

	.ui-card.md .ui-card-header,
	.ui-card.md .ui-card-footer {
		padding: var(--space-4) var(--space-6);
	}

	.ui-card.md .ui-card-body {
		padding: var(--space-5) var(--space-6);
	}

	.ui-card.lg .ui-card-header,
	.ui-card.lg .ui-card-footer {
		padding: var(--space-5) var(--space-8);
	}

	.ui-card.lg .ui-card-body {
		padding: var(--space-6) var(--space-8);
	}

	/* Responsive - sm on mobile, md on desktop */
	.ui-card.responsive .ui-card-header,
	.ui-card.responsive .ui-card-body,
	.ui-card.responsive .ui-card-footer {
		padding: var(--space-3) var(--space-4);
	}

	@media (min-width: 480px) {
		.ui-card.responsive .ui-card-header,
		.ui-card.responsive .ui-card-footer {
			padding: var(--space-4) var(--space-6);
		}

		.ui-card.responsive .ui-card-body {
			padding: var(--space-5) var(--space-6);
		}
	}

	/* Sections */
	.ui-card-header {
		text-align: center;
		border-bottom: 1px solid var(--border-primary);
	}

	.ui-card-footer {
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-primary);
		text-align: center;
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
