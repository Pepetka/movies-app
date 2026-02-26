<script lang="ts">
	import type { IProps } from './FAB.types.svelte';

	const {
		icon,
		label,
		size = 'md',
		position = 'bottom-right',
		type = 'button',
		disabled,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const isExtended = $derived(size === 'lg');
	const iconContent = $derived(icon || children);
</script>

<button
	{type}
	class={['ui-fab', size, position, className]}
	{disabled}
	aria-label={label || 'Action'}
	{...restProps}
>
	{#if iconContent}
		<span class="ui-fab-icon">{@render iconContent()}</span>
	{/if}
	{#if isExtended && label}
		<span class="ui-fab-label">{label}</span>
	{/if}
</button>

<style>
	.ui-fab {
		position: fixed;
		z-index: var(--z-fixed);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		border: none;
		border-radius: var(--radius-full);
		background-color: var(--color-primary);
		color: var(--text-inverse);
		font-family: inherit;
		font-weight: var(--font-medium);
		cursor: pointer;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out);
	}

	.ui-fab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.ui-fab.md {
		width: var(--fab-md-size);
		height: var(--fab-md-size);
	}

	.ui-fab.sm {
		width: var(--fab-sm-size);
		height: var(--fab-sm-size);
		gap: var(--space-2);
	}

	.ui-fab.lg {
		height: var(--fab-lg-height);
		padding: 0 var(--space-4);
		min-width: calc(var(--fab-lg-height) * 2);
	}

	.ui-fab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ui-fab.md .ui-fab-icon,
	.ui-fab.sm .ui-fab-icon {
		width: 100%;
		height: 100%;
	}

	.ui-fab.lg .ui-fab-icon {
		font-size: var(--fab-icon-size);
	}

	.ui-fab-label {
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
	}

	/* Positions */
	.ui-fab.bottom-right {
		right: var(--fab-margin);
		bottom: var(--fab-margin);
	}

	.ui-fab.bottom-left {
		left: var(--fab-margin);
		bottom: var(--fab-margin);
	}

	.ui-fab.bottom-center {
		left: 50%;
		transform: translateX(-50%);
		bottom: var(--fab-margin);
	}

	/* Hover & Active */
	.ui-fab:not(:disabled):hover {
		background-color: var(--color-primary-hover);
		box-shadow: var(--shadow-xl);
	}

	.ui-fab:not(:disabled):active {
		background-color: var(--color-primary-active);
		transform: scale(0.95) var(--fab-bottom-center-transform, translateX(-50%));
	}

	.ui-fab.bottom-center:not(:disabled):active {
		--fab-bottom-center-transform: translateX(-50%);
	}

	/* Focus */
	.ui-fab:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
