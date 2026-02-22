<script lang="ts">
	import { User } from '@lucide/svelte';

	import { getAvatarIconSize } from '../../utils/avatar-size';
	import type { IProps } from './Avatar.types.svelte';

	const { src, name, size = 'md', alt, class: className, ...restProps }: IProps = $props();

	let imageLoaded = $state(false);
	let imageError = $state(false);

	const AVATAR_COLORS = [
		'var(--avatar-color-1)',
		'var(--avatar-color-2)',
		'var(--avatar-color-3)',
		'var(--avatar-color-4)',
		'var(--avatar-color-5)',
		'var(--avatar-color-6)',
		'var(--avatar-color-7)',
		'var(--avatar-color-8)'
	] as const;

	const getColorForName = (nameToHash: string): string => {
		let hash = 0;
		for (let i = 0; i < nameToHash.length; i++) {
			hash = nameToHash.charCodeAt(i) + ((hash << 5) - hash);
		}
		return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
	};

	const getInitials = (nameToInitials: string): string => {
		const parts = nameToInitials.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return nameToInitials.slice(0, 2).toUpperCase();
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
		imageError = false;
		imageLoaded = !!src;
	});

	const showImage = $derived(src && imageLoaded && !imageError);
	const showInitials = $derived(name && (!src || imageError));
	const showIcon = $derived(!name && (!src || imageError));
	const initials = $derived(name ? getInitials(name) : '');
	const backgroundColor = $derived(name ? getColorForName(name) : undefined);
	const iconColor = $derived(name ? 'var(--text-inverse)' : 'var(--text-tertiary)');

	const ariaLabel = $derived(alt || name || 'Avatar');
</script>

<span
	class={['ui-avatar', size, className]}
	role="img"
	aria-label={ariaLabel}
	style:background-color={backgroundColor}
	style:color={showIcon ? iconColor : undefined}
	{...restProps}
>
	{#if showImage}
		<img {src} alt={alt || ''} onerror={handleImageError} onload={handleImageLoad} />
	{:else if showInitials}
		<span class="ui-avatar-initials">{initials}</span>
	{:else if showIcon}
		<User size={getAvatarIconSize(size)} absoluteStrokeWidth />
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
	}

	.ui-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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
