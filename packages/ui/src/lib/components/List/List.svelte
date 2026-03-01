<script lang="ts">
	import type { IProps } from './List.types.svelte';

	const {
		dividers = true,
		variant = 'plain',
		ordered = false,
		ariaLabel,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const tag = $derived(ordered ? 'ol' : 'ul');
</script>

<svelte:element
	this={tag}
	class={['ui-list', variant, ordered && 'ordered', !dividers && 'no-dividers', className]}
	role="list"
	aria-label={ariaLabel}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>

<style>
	.ui-list {
		display: flex;
		flex-direction: column;
		list-style: none;
		margin: 0;
		padding: 0;
		border-radius: var(--radius-xl);
		overflow: hidden;
		counter-reset: list-counter;
	}

	/* Ordered list styling - add numbers via counter */
	.ui-list.ordered {
		padding-left: var(--space-4);
	}

	.ui-list.ordered :global(.ui-list-item) {
		position: relative;
		padding-left: var(--space-6);
	}

	.ui-list.ordered :global(.ui-list-item)::before {
		content: counter(list-counter) '.';
		counter-increment: list-counter;
		position: absolute;
		left: 0;
		color: var(--text-secondary);
		font-weight: var(--font-medium);
	}

	/* Variants */
	.ui-list.plain {
		background-color: transparent;
		border: none;
	}

	.ui-list.outlined {
		background-color: var(--bg-primary);
		border: var(--border-width-thin) solid var(--border-primary);
	}

	.ui-list.filled {
		background-color: var(--bg-secondary);
		border: none;
	}

	/* Dividers */
	.ui-list:not(.no-dividers) :global(.ui-list-item:not(:last-child)) {
		border-bottom: var(--border-width-thin) solid var(--border-primary);
	}
</style>
