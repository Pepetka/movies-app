<script lang="ts">
	import type { IProps } from './Badge.types.svelte';

	const {
		variant = 'default',
		size = 'md',
		class: className,
		children,
		...restProps
	}: IProps = $props();
</script>

<span class={['ui-badge', variant, size, className]} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	.ui-badge {
		display: inline-flex;
		align-items: center;
		border-radius: var(--radius-md);
		font-family: inherit;
		font-weight: var(--font-medium);
		line-height: 1.25;
		white-space: nowrap;
	}

	/* Sizes */
	.ui-badge.sm {
		padding: var(--badge-sm-padding);
		font-size: var(--badge-sm-font);
	}

	.ui-badge.md {
		padding: var(--badge-md-padding);
		font-size: var(--badge-md-font);
	}

	/* Variants */
	.ui-badge.default {
		background-color: var(--badge-default-bg);
		color: var(--badge-default-text);
	}

	.ui-badge.primary {
		background-color: var(--badge-primary-bg);
		color: var(--badge-primary-text);
	}

	.ui-badge.success {
		background-color: var(--badge-success-bg);
		color: var(--badge-success-text);
	}

	.ui-badge.warning {
		background-color: var(--badge-warning-bg);
		color: var(--badge-warning-text);
	}

	.ui-badge.error {
		background-color: var(--badge-error-bg);
		color: var(--badge-error-text);
	}
</style>
