<script lang="ts">
	import type { IProps } from './Container.types.svelte';

	const {
		size = 'xl',
		centered = true,
		class: className,
		children,
		...restProps
	}: IProps = $props();
</script>

<div class={['ui-container', size, centered && 'centered', className]} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.ui-container {
		width: 100%;
		padding-left: var(--container-padding);
		padding-right: var(--container-padding);
	}

	.ui-container.centered {
		margin-left: auto;
		margin-right: auto;
	}

	.ui-container.sm {
		max-width: var(--container-sm-max-width);
	}

	.ui-container.md {
		max-width: var(--container-md-max-width);
	}

	.ui-container.lg {
		max-width: var(--container-lg-max-width);
	}

	.ui-container.xl {
		max-width: var(--container-xl-max-width);
	}

	.ui-container.full {
		max-width: 100%;
	}
</style>
