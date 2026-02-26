<script lang="ts">
	import type { IProps } from './BottomNav.types.svelte';
	import { getIconSize } from '../../utils/size';

	let {
		items,
		value = $bindable(),
		defaultValue,
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	const iconSize = getIconSize('md');

	let internalValue = $state<string | undefined>(undefined);
	let navLinks: Record<string, HTMLAnchorElement | null> = $state.raw({});

	const activeItem = $derived(value ?? internalValue ?? defaultValue ?? items[0]?.id ?? '');
	const visibleItems = $derived(items.filter((item) => !item.hidden));

	const setActiveItem = (id: string) => {
		if (value === undefined) {
			internalValue = id;
		} else {
			value = id;
		}
		onChange?.(id);
	};

	const handleClick = (event: MouseEvent, item: { id: string; disabled?: boolean }) => {
		if (item.disabled) {
			event.preventDefault();
			return;
		}
		setActiveItem(item.id);
	};

	const handleKeydown = (event: KeyboardEvent, item: { id: string; disabled?: boolean }) => {
		if (item.disabled) return;

		const visibleCount = visibleItems.length;
		if (visibleCount === 0) return;

		const currentIndex = visibleItems.findIndex((i) => i.id === item.id);
		let nextIndex: number;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				nextIndex = (currentIndex - 1 + visibleCount) % visibleCount;
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextIndex = (currentIndex + 1) % visibleCount;
				break;
			case 'Home':
				event.preventDefault();
				nextIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				nextIndex = visibleCount - 1;
				break;
			default:
				return;
		}

		const nextItem = visibleItems[nextIndex];
		if (nextItem && !nextItem.disabled) {
			navLinks[nextItem.id]?.focus();
		}
	};
</script>

<nav class={['ui-bottom-nav', className]} aria-label="Main navigation" {...restProps}>
	{#each visibleItems as item (item.id)}
		{@const Icon = item.Icon}
		{@const isActive = item.id === activeItem}
		<a
			bind:this={navLinks[item.id]}
			class={['ui-bottom-nav-item', { active: isActive, disabled: item.disabled }]}
			href={item.disabled ? undefined : item.href}
			aria-current={isActive ? 'page' : undefined}
			aria-disabled={item.disabled}
			onclick={(e) => handleClick(e, item)}
			onkeydown={(e) => handleKeydown(e, item)}
		>
			<span class="ui-bottom-nav-icon">
				<Icon size={iconSize} />
				{#if item.badge !== undefined && item.badge > 0}
					<span
						class="ui-bottom-nav-badge"
						aria-label={item.badgeLabel ?? `${item.badge} notifications`}
					>
						{item.badge > 99 ? '99+' : item.badge}
					</span>
				{/if}
			</span>
			<span class="ui-bottom-nav-label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.ui-bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-fixed);
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 56px;
		padding-bottom: env(safe-area-inset-bottom);
		background-color: var(--bottom-nav-bg);
		border-top: 1px solid var(--bottom-nav-border);
	}

	.ui-bottom-nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		flex: 1;
		height: 100%;
		padding: var(--space-2) var(--space-1);
		text-decoration: none;
		color: var(--text-secondary);
		background: transparent;
		border: none;
		cursor: pointer;
		position: relative;
		transition: color var(--transition-fast) var(--ease-out);
		-webkit-tap-highlight-color: transparent;
	}

	.ui-bottom-nav-item:hover:not(.active):not(.disabled) {
		color: var(--text-primary);
	}

	.ui-bottom-nav-item:active:not(.disabled) {
		transform: scale(0.95);
	}

	.ui-bottom-nav-item.active {
		color: var(--color-primary);
	}

	.ui-bottom-nav-item.disabled {
		color: var(--text-tertiary);
		cursor: not-allowed;
		opacity: 0.5;
	}

	.ui-bottom-nav-item:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: -2px;
		border-radius: var(--radius-sm);
	}

	.ui-bottom-nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.ui-bottom-nav-label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		line-height: 1;
	}

	.ui-bottom-nav-badge {
		position: absolute;
		top: calc(var(--space-1) * -1);
		right: calc(var(--space-2) * -1);
		min-width: var(--bottom-nav-badge-min-width);
		height: var(--bottom-nav-badge-size);
		padding: 0 var(--bottom-nav-badge-padding-x);
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		color: var(--text-inverse);
		background-color: var(--color-error);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
