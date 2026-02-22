<script lang="ts">
	import type { IProps } from './IconButton.types.svelte';
	import { getIconSize } from '../../utils/size';

	const {
		Icon,
		label,
		size = 'md',
		variant = 'ghost',
		type = 'button',
		disabled,
		pressed,
		class: className,
		children,
		...restProps
	}: IProps = $props();
</script>

<button
	{type}
	class={['ui-icon-btn', variant, size, className]}
	{disabled}
	aria-label={label}
	aria-pressed={pressed}
	{...restProps}
>
	<Icon size={getIconSize(size)} absoluteStrokeWidth />
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.ui-icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-lg);
		background: transparent;
		cursor: pointer;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.ui-icon-btn.sm {
		width: var(--space-8);
		height: var(--space-8);
	}

	.ui-icon-btn.md {
		width: var(--space-10);
		height: var(--space-10);
	}

	.ui-icon-btn.lg {
		width: var(--space-12);
		height: var(--space-12);
	}

	/* Ghost */
	.ui-icon-btn.ghost {
		color: var(--text-secondary);
	}

	.ui-icon-btn.ghost:hover:not(:disabled) {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}

	.ui-icon-btn.ghost:active:not(:disabled) {
		background-color: var(--bg-tertiary);
		transform: scale(0.95);
	}

	/* Secondary */
	.ui-icon-btn.secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		border: var(--border-width-thin) solid var(--border-primary);
	}

	.ui-icon-btn.secondary:hover:not(:disabled) {
		background-color: var(--bg-tertiary);
		border-color: var(--border-secondary);
	}

	.ui-icon-btn.secondary:active:not(:disabled) {
		transform: scale(0.95);
	}

	/* Primary */
	.ui-icon-btn.primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
	}

	.ui-icon-btn.primary:hover:not(:disabled) {
		background-color: var(--color-primary-hover);
	}

	.ui-icon-btn.primary:active:not(:disabled) {
		background-color: var(--color-primary-active);
		transform: scale(0.95);
	}

	/* Focus */
	.ui-icon-btn:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
