<script lang="ts">
	import type { IProps } from './Grid.types.svelte';

	const { cols, gap = 'md', class: className, children, style, ...restProps }: IProps = $props();

	const isResponsiveArray = $derived(Array.isArray(cols));

	const gridStyle = $derived(() => {
		let result = style || '';

		if (typeof cols === 'number') {
			result = `grid-template-columns: repeat(${cols}, 1fr); ${result}`;
		} else if (Array.isArray(cols)) {
			result = `--cols-sm: ${cols[0]}; --cols-md: ${cols[1]}; --cols-lg: ${cols[2]}; ${result}`;
		}

		return result || undefined;
	});
</script>

<div
	class={[
		'ui-grid',
		`gap-${gap}`,
		!cols && 'responsive',
		isResponsiveArray && 'responsive-cols',
		className
	]}
	style={gridStyle()}
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

	/* Default responsive */
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

	/* Custom responsive via CSS variables */
	.ui-grid.responsive-cols {
		grid-template-columns: repeat(var(--cols-sm, 2), 1fr);
	}

	@media (min-width: 768px) {
		.ui-grid.responsive-cols {
			grid-template-columns: repeat(var(--cols-md, 3), 1fr);
		}
	}

	@media (min-width: 1024px) {
		.ui-grid.responsive-cols {
			grid-template-columns: repeat(var(--cols-lg, 4), 1fr);
		}
	}
</style>
