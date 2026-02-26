<script lang="ts">
	import type { IProps } from './Skeleton.types.svelte';

	const {
		variant = 'text',
		size = 'md',
		width,
		height,
		rounded = false,
		full = false,
		class: className,
		...restProps
	}: IProps = $props();

	const formatDimension = (value: string | number | undefined): string | undefined => {
		if (value === undefined) return undefined;
		return typeof value === 'number' ? `${value}px` : value;
	};

	const styleWidth = $derived(formatDimension(width));
	const styleHeight = $derived(formatDimension(height));
</script>

<span
	class={['ui-skeleton', variant, size, rounded && 'rounded', full && 'full', className]}
	role="status"
	aria-busy="true"
	aria-label="Loading"
	style:width={styleWidth}
	style:height={styleHeight}
	{...restProps}
>
	<span class="sr-only">Loading...</span>
</span>

<style>
	.ui-skeleton {
		display: block;
		background: linear-gradient(
			90deg,
			var(--skeleton-bg) 25%,
			var(--skeleton-shimmer) 50%,
			var(--skeleton-bg) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Text variant */
	.ui-skeleton.text {
		border-radius: var(--radius-sm);
		width: 100%;
	}

	.ui-skeleton.text.sm {
		height: var(--skeleton-text-sm);
	}

	.ui-skeleton.text.md {
		height: var(--skeleton-text-md);
	}

	.ui-skeleton.text.lg {
		height: var(--skeleton-text-lg);
	}

	/* Circular variant */
	.ui-skeleton.circular {
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.ui-skeleton.circular.sm {
		width: var(--skeleton-circular-sm);
		height: var(--skeleton-circular-sm);
	}

	.ui-skeleton.circular.md {
		width: var(--skeleton-circular-md);
		height: var(--skeleton-circular-md);
	}

	.ui-skeleton.circular.lg {
		width: var(--skeleton-circular-lg);
		height: var(--skeleton-circular-lg);
	}

	/* Rectangular variant */
	.ui-skeleton.rectangular {
		border-radius: var(--radius-md);
		width: 100%;
	}

	.ui-skeleton.rectangular.sm {
		height: var(--skeleton-rect-sm);
	}

	.ui-skeleton.rectangular.md {
		height: var(--skeleton-rect-md);
	}

	.ui-skeleton.rectangular.lg {
		height: var(--skeleton-rect-lg);
	}

	/* Rounded modifier */
	.ui-skeleton.rounded {
		border-radius: var(--radius-xl);
	}

	/* Full modifier */
	.ui-skeleton.full {
		width: 100% !important;
		height: 100% !important;
	}
</style>
