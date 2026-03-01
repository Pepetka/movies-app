<script lang="ts">
	import { ImageOff } from '@lucide/svelte';

	import type { IProps } from './Image.types.svelte';
	import { Skeleton } from '../Skeleton';

	const {
		src,
		alt = '',
		ratio,
		width,
		height,
		objectFit = 'cover',
		rounded = false,
		fallback,
		loading = 'lazy',
		skeleton = false,
		class: className,
		...restProps
	}: IProps = $props();

	let imageLoaded = $state(false);
	let imageError = $state(false);

	const formatDimension = (value: string | number | undefined): string | undefined => {
		if (value === undefined) return undefined;
		return typeof value === 'number' ? `${value}px` : value;
	};

	const handleImageLoad = () => {
		imageLoaded = true;
		imageError = false;
	};

	const handleImageError = () => {
		imageLoaded = false;
		imageError = true;
	};

	$effect(() => {
		const _src = src;
		imageLoaded = false;
		imageError = false;
	});

	const showImage = $derived(!skeleton && src && imageLoaded && !imageError);
	const showSkeleton = $derived(skeleton || (src && !imageLoaded && !imageError));
	const showFallback = $derived(!skeleton && (!src || imageError));

	const styleWidth = $derived(formatDimension(width));
	const styleHeight = $derived(formatDimension(height));

	const aspectRatio = $derived(
		ratio
			? ratio
					.split('/')
					.map(Number)
					.reduce((a, b) => a / b)
			: undefined
	);

	const ariaLabel = $derived(alt || 'Image');
</script>

<div
	class={['ui-image', rounded && 'rounded', className]}
	role="img"
	aria-label={ariaLabel}
	style:width={styleWidth}
	style:height={styleHeight}
	style:aspect-ratio={aspectRatio}
	{...restProps}
>
	{#if src}
		<img
			{src}
			{alt}
			class={['ui-image-img', objectFit, imageLoaded && 'loaded', imageError && 'error']}
			{loading}
			onload={handleImageLoad}
			onerror={handleImageError}
			style:opacity={showImage ? 1 : 0}
		/>
	{/if}

	{#if showSkeleton}
		<Skeleton variant="rectangular" full class="ui-image-skeleton" />
	{/if}

	{#if showFallback}
		{#if fallback}
			{@render fallback()}
		{:else}
			<div class="ui-image-fallback">
				<ImageOff size={24} absoluteStrokeWidth />
			</div>
		{/if}
	{/if}
</div>

<style>
	.ui-image {
		display: block;
		position: relative;
		overflow: hidden;
		background-color: var(--bg-secondary);
		width: 100%;
	}

	.ui-image.rounded {
		border-radius: var(--radius-xl);
	}

	.ui-image-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		transition: opacity 0.2s ease;
	}

	.ui-image-img.cover {
		object-fit: cover;
	}

	.ui-image-img.contain {
		object-fit: contain;
	}

	.ui-image-img.fill {
		object-fit: fill;
	}

	.ui-image-img.none {
		object-fit: none;
	}

	.ui-image-img.scale-down {
		object-fit: scale-down;
	}

	.ui-image :global(.ui-image-skeleton) {
		position: absolute;
		inset: 0;
	}

	.ui-image-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-tertiary);
	}
</style>
