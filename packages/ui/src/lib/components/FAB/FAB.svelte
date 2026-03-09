<script lang="ts">
	import type { IProps } from './FAB.types.svelte';

	const {
		icon,
		label,
		size = 'responsive',
		variant = 'primary',
		position = 'bottom-right',
		offset = 'default',
		type = 'button',
		disabled,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const iconContent = $derived(icon || children);
</script>

<button
	{type}
	class={['ui-fab', variant, size, position, offset !== 'default' && `offset-${offset}`, className]}
	{disabled}
	aria-label={label || 'Action'}
	{...restProps}
>
	{#if iconContent}
		<span class="ui-fab-icon">{@render iconContent()}</span>
	{/if}
	{#if label}
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
		font-family: inherit;
		font-weight: var(--font-medium);
		cursor: pointer;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out);
	}

	.ui-fab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Variants */
	.ui-fab.primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		box-shadow: var(--shadow-lg);
	}

	@media (hover: hover) {
		.ui-fab.primary:not(:disabled):hover {
			background-color: var(--color-primary-hover);
			box-shadow: var(--shadow-xl);
		}
	}

	.ui-fab.primary:not(:disabled):active {
		background-color: var(--color-primary-active);
	}

	.ui-fab.secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		border: var(--border-width-thin) solid var(--border-primary);
		box-shadow: var(--shadow-md);
	}

	@media (hover: hover) {
		.ui-fab.secondary:not(:disabled):hover {
			background-color: var(--bg-tertiary);
			border-color: var(--border-secondary);
			box-shadow: var(--shadow-lg);
		}
	}

	.ui-fab.secondary:not(:disabled):active {
		background-color: var(--bg-tertiary);
	}

	.ui-fab.ghost {
		background-color: rgba(var(--bg-primary-rgb), 0.85);
		color: var(--text-primary);
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	@media (hover: hover) {
		.ui-fab.ghost:not(:disabled):hover {
			background-color: rgba(var(--bg-secondary-rgb), 0.9);
			box-shadow: var(--shadow-lg);
		}
	}

	.ui-fab.ghost:not(:disabled):active {
		background-color: rgba(var(--bg-tertiary-rgb), 0.9);
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

	/* Responsive - sm on mobile, md on tablet, lg (extended) on desktop */
	.ui-fab.responsive {
		width: var(--fab-sm-size);
		height: var(--fab-sm-size);
		gap: var(--space-2);
	}

	@media (min-width: 480px) {
		.ui-fab.responsive {
			width: var(--fab-md-size);
			height: var(--fab-md-size);
		}
	}

	@media (min-width: 768px) {
		.ui-fab.responsive {
			width: auto;
			height: var(--fab-lg-height);
			padding: 0 var(--space-4);
			min-width: calc(var(--fab-lg-height) * 2);
		}
	}

	.ui-fab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ui-fab.md .ui-fab-icon,
	.ui-fab.sm .ui-fab-icon,
	.ui-fab.responsive .ui-fab-icon {
		width: 100%;
		height: 100%;
	}

	@media (min-width: 768px) {
		.ui-fab.responsive .ui-fab-icon {
			width: auto;
			height: auto;
			font-size: var(--fab-icon-size);
		}
	}

	.ui-fab.lg .ui-fab-icon {
		font-size: var(--fab-icon-size);
	}

	.ui-fab-label {
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
	}

	/* Hide label on small sizes */
	.ui-fab.sm .ui-fab-label,
	.ui-fab.md .ui-fab-label {
		display: none;
	}

	/* Responsive label - hidden on mobile, visible on desktop */
	.ui-fab.responsive .ui-fab-label {
		display: none;
	}

	@media (min-width: 768px) {
		.ui-fab.responsive .ui-fab-label {
			display: block;
		}
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

	/* Offset from bottom nav */
	.ui-fab.above-bottom-nav.bottom-right,
	.ui-fab.above-bottom-nav.bottom-left {
		bottom: var(--fab-offset-bottom-nav);
	}

	.ui-fab.above-bottom-nav.bottom-center {
		bottom: var(--fab-offset-bottom-nav);
	}

	/* Active */
	.ui-fab:not(:disabled):active {
		transform: scale(0.95);
	}

	.ui-fab.bottom-center:not(:disabled):active {
		transform: scale(0.95) translateX(-50%);
	}

	/* Focus */
	.ui-fab:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
