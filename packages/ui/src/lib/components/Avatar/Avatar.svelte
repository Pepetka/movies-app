<script lang="ts">
	import { User } from '@lucide/svelte';

	import {
		getAvatarIconSize,
		getAvatarColor,
		getAvatarInitials,
		type AvatarSize
	} from '../../utils/avatar-size';
	import type { IProps } from './Avatar.types.svelte';
	import { Skeleton } from '../Skeleton';

	let {
		src,
		name,
		size = 'md' as AvatarSize,
		alt,
		skeleton = false,
		loading = 'lazy',
		class: className,
		...restProps
	}: IProps = $props();

	let imageLoaded = $state(false);
	let imageError = $state(false);

	$effect(() => {
		const _src = src;
		imageLoaded = false;
		imageError = false;
	});

	const handleImageLoad = () => {
		imageLoaded = true;
		imageError = false;
	};

	const handleImageError = () => {
		imageLoaded = false;
		imageError = true;
	};

	const showImage = $derived(!skeleton && src && imageLoaded && !imageError);
	const showSkeleton = $derived(skeleton || (src && !imageLoaded && !imageError));
	const showInitials = $derived(!skeleton && name && (!src || imageError));
	const showIcon = $derived(!skeleton && !name && (!src || imageError));

	const initials = $derived(name ? getAvatarInitials(name) : '');
	const backgroundColor = $derived(name && (!src || imageError) ? getAvatarColor(name) : undefined);
	const iconSize = $derived(getAvatarIconSize(size));
	const ariaLabel = $derived(alt || name || 'Avatar');
</script>

<span
	class={['ui-avatar', size, className]}
	role="img"
	aria-label={ariaLabel}
	style:background-color={backgroundColor}
	{...restProps}
>
	{#if src}
		<img
			{src}
			{alt}
			class={['ui-avatar-img', imageLoaded && 'loaded', imageError && 'error']}
			{loading}
			onload={handleImageLoad}
			onerror={handleImageError}
			style:opacity={showImage ? 1 : 0}
		/>
	{/if}

	{#if showSkeleton}
		<Skeleton variant="circular" full class="ui-avatar-skeleton" />
	{/if}

	{#if showInitials}
		<span class="ui-avatar-initials">{initials}</span>
	{/if}

	{#if showIcon}
		<User size={iconSize} absoluteStrokeWidth class="ui-avatar-icon" />
	{/if}
</span>

<style>
	.ui-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		overflow: hidden;
		background-color: var(--bg-secondary);
		color: var(--text-inverse);
		font-weight: var(--font-medium);
		user-select: none;
		flex-shrink: 0;
		position: relative;
	}

	.ui-avatar img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: opacity 0.2s ease;
	}

	.ui-avatar-icon {
		color: var(--text-tertiary);
	}

	.ui-avatar-initials {
		text-transform: uppercase;
		line-height: 1;
	}

	/* Sizes */
	.ui-avatar.xs {
		width: var(--avatar-xs-size);
		height: var(--avatar-xs-size);
		font-size: var(--avatar-xs-font);
	}

	.ui-avatar.sm {
		width: var(--avatar-sm-size);
		height: var(--avatar-sm-size);
		font-size: var(--avatar-sm-font);
	}

	.ui-avatar.md {
		width: var(--avatar-md-size);
		height: var(--avatar-md-size);
		font-size: var(--avatar-md-font);
	}

	.ui-avatar.lg {
		width: var(--avatar-lg-size);
		height: var(--avatar-lg-size);
		font-size: var(--avatar-lg-font);
	}

	.ui-avatar.xl {
		width: var(--avatar-xl-size);
		height: var(--avatar-xl-size);
		font-size: var(--avatar-xl-font);
	}
</style>
