<script lang="ts">
	import type { ButtonProps, LinkProps } from './Button.types.svelte';
	import { Skeleton } from '../Skeleton';

	// Union types require extracting props separately due to TypeScript limitations
	// with destructuring properties that exist only in one variant
	const props = $props<ButtonProps | LinkProps>();

	// Common props (exist in both variants)
	const variant = $derived(props.variant ?? 'primary');
	const size = $derived(props.size ?? 'responsive');
	const loading = $derived(props.loading ?? false);
	const fullWidth = $derived(props.fullWidth ?? false);
	const className = $derived(props.class);
	const children = $derived(props.children);

	// Variant-specific props
	const href = $derived('href' in props ? props.href : undefined);
	const disabled = $derived('disabled' in props ? props.disabled : undefined);
	const type = $derived('type' in props ? (props.type ?? 'button') : undefined);

	const isDisabled = $derived(disabled || loading);
	const isLink = $derived(!!href);

	const buttonClasses = $derived(
		['ui-btn', variant, size, fullWidth && 'full-width', loading && 'loading', className]
			.filter(Boolean)
			.join(' ')
	);

	// Extract rest props for each element type to avoid passing invalid attributes
	const buttonRest = $derived(() => {
		if (isLink) return {};
		const {
			variant: _,
			size: _s,
			loading: _l,
			fullWidth: _f,
			class: _c,
			children: _ch,
			type: _t,
			disabled: _d,
			...rest
		} = props as ButtonProps;
		return rest;
	});

	const linkRest = $derived(() => {
		if (!isLink) return {};
		const {
			variant: _,
			size: _s,
			loading: _l,
			fullWidth: _f,
			class: _c,
			children: _ch,
			href: _h,
			...rest
		} = props as LinkProps;
		return rest;
	});
</script>

{#if isLink}
	<a
		{href}
		class={buttonClasses}
		aria-busy={loading}
		aria-disabled={isDisabled || undefined}
		{...linkRest()}
	>
		{#if children}
			<span class="ui-btn-content">
				{@render children()}
			</span>
		{/if}
		{#if loading}
			<Skeleton variant="text" full class="ui-btn-skeleton" />
		{/if}
	</a>
{:else}
	<button {type} class={buttonClasses} disabled={isDisabled} aria-busy={loading} {...buttonRest()}>
		{#if children}
			<span class="ui-btn-content">
				{@render children()}
			</span>
		{/if}
		{#if loading}
			<Skeleton variant="text" full class="ui-btn-skeleton" />
		{/if}
	</button>
{/if}

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
		text-decoration: none;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-btn:disabled,
	.ui-btn[aria-disabled='true'] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
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

	/* Responsive - sm on mobile, md on tablet, lg on desktop */
	.ui-btn.responsive {
		padding: var(--btn-sm-padding);
		font-size: var(--btn-sm-font);
		min-height: var(--btn-sm-height);
		gap: var(--space-1);
	}

	@media (min-width: 480px) {
		.ui-btn.responsive {
			padding: var(--btn-md-padding);
			font-size: var(--btn-md-font);
			min-height: var(--btn-md-height);
			gap: var(--space-2);
		}
	}

	/* Primary */
	.ui-btn.primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
	}

	@media (hover: hover) {
		.ui-btn.primary:hover:not(:disabled) {
			background-color: var(--color-primary-hover);
			border-color: var(--color-primary-hover);
		}
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

	@media (hover: hover) {
		.ui-btn.secondary:hover:not(:disabled) {
			background-color: var(--bg-tertiary);
			border-color: var(--border-secondary);
		}
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

	@media (hover: hover) {
		.ui-btn.ghost:hover:not(:disabled) {
			background-color: var(--bg-secondary);
		}
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

	@media (hover: hover) {
		.ui-btn.danger:hover:not(:disabled) {
			background-color: var(--color-error-hover);
			border-color: var(--color-error-hover);
		}
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
