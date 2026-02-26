<script lang="ts">
	import type { IProps } from './Grid.types.svelte';

	const { cols, gap = 'md', class: className, children, style, ...restProps }: IProps = $props();

	const gridStyle = $derived(
		cols ? `grid-template-columns: repeat(${cols}, 1fr); ${style || ''}` : style
	);
</script>

<div
	class={['ui-grid', `gap-${gap}`, !cols && 'responsive', className]}
	style={gridStyle}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.ui-grid {
		display: grid;
		width: 100%;
	}

	.ui-grid.gap-none {
		gap: var(--grid-none-gap);
	}

	.ui-grid.gap-sm {
		gap: var(--grid-sm-gap);
	}

	.ui-grid.gap-md {
		gap: var(--grid-md-gap);
	}

	.ui-grid.gap-lg {
		gap: var(--grid-lg-gap);
	}

	.ui-grid.responsive {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (min-width: 768px) {
		.ui-grid.responsive {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.ui-grid.responsive {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
