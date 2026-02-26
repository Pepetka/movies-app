<script lang="ts">
	import type { IProps } from './Button.types.svelte';
	import { Skeleton } from '../Skeleton';

	const {
		variant = 'primary',
		size = 'md',
		loading = false,
		fullWidth = false,
		type = 'button',
		disabled,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const isDisabled = $derived(disabled || loading);
</script>

<button
	{type}
	class={['ui-btn', variant, size, fullWidth && 'full-width', loading && 'loading', className]}
	disabled={isDisabled}
	aria-busy={loading}
	{...restProps}
>
	{#if children}
		<span class="ui-btn-content">
			{@render children()}
		</span>
	{/if}
	{#if loading}
		<Skeleton variant="text" full class="ui-btn-skeleton" />
	{/if}
</button>

<style>
	.ui-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border: var(--border-width-thin) solid transparent;
		border-radius: var(--radius-lg);
		font-family: inherit;
		font-weight: var(--font-medium);
		line-height: var(--leading-tight);
		white-space: nowrap;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-btn.full-width {
		width: 100%;
	}

	.ui-btn-content {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: inherit;
	}

	.ui-btn :global(.ui-btn-skeleton) {
		position: absolute;
		inset: 0;
		opacity: 0.7;
	}

	/* Sizes */
	.ui-btn.sm {
		padding: var(--btn-sm-padding);
		font-size: var(--btn-sm-font);
		min-height: var(--btn-sm-height);
		gap: var(--space-1);
	}

	.ui-btn.md {
		padding: var(--btn-md-padding);
		font-size: var(--btn-md-font);
		min-height: var(--btn-md-height);
	}

	.ui-btn.lg {
		padding: var(--btn-lg-padding);
		font-size: var(--btn-lg-font);
		min-height: var(--btn-lg-height);
		gap: var(--space-3);
	}

	/* Primary */
	.ui-btn.primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
	}

	.ui-btn.primary:hover:not(:disabled) {
		background-color: var(--color-primary-hover);
		border-color: var(--color-primary-hover);
	}

	.ui-btn.primary:active:not(:disabled) {
		background-color: var(--color-primary-active);
		border-color: var(--color-primary-active);
		transform: scale(0.98);
	}

	/* Secondary */
	.ui-btn.secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		border-color: var(--border-primary);
	}

	.ui-btn.secondary:hover:not(:disabled) {
		background-color: var(--bg-tertiary);
		border-color: var(--border-secondary);
	}

	.ui-btn.secondary:active:not(:disabled) {
		transform: scale(0.98);
	}

	/* Ghost */
	.ui-btn.ghost {
		background-color: transparent;
		color: var(--text-primary);
		border-color: transparent;
	}

	.ui-btn.ghost:hover:not(:disabled) {
		background-color: var(--bg-secondary);
	}

	.ui-btn.ghost:active:not(:disabled) {
		background-color: var(--bg-tertiary);
		transform: scale(0.98);
	}

	/* Danger */
	.ui-btn.danger {
		background-color: var(--color-error);
		color: var(--text-inverse);
		border-color: var(--color-error);
	}

	.ui-btn.danger:hover:not(:disabled) {
		background-color: var(--color-error-hover);
		border-color: var(--color-error-hover);
	}

	.ui-btn.danger:active:not(:disabled) {
		background-color: var(--color-error-active);
		border-color: var(--color-error-active);
		transform: scale(0.98);
	}

	/* Focus */
	.ui-btn:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
