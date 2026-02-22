<script lang="ts">
	import { getIconSize } from '$lib/utils/size';

	import type { IProps } from './BottomNav.types.svelte';

	const {
		items,
		value: controlledValue,
		defaultValue,
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	let internalValue = $state(defaultValue ?? items[0]?.id ?? '');
	const activeItem = $derived(controlledValue ?? internalValue);

	const visibleItems = $derived(items.filter((item) => !item.hidden));

	const navLinks = $state<(HTMLAnchorElement | null)[]>([]);

	const onChangeActiveItem = (id: string) => {
		internalValue = id;
		onChange?.(id);
	};

	const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
		const enabledIndices = visibleItems.map((_, i) => i);

		// eslint-disable-next-line no-useless-assignment -- assigned in switch
		let nextIndex = currentIndex;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				nextIndex =
					(enabledIndices.indexOf(currentIndex) - 1 + enabledIndices.length) %
					enabledIndices.length;
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextIndex = (currentIndex + 1) % enabledIndices.length;
				break;
			case 'Home':
				event.preventDefault();
				nextIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				nextIndex = enabledIndices.length - 1;
				break;
			default:
				return;
		}

		navLinks[nextIndex]?.focus();
	};
</script>

<nav class={['ui-bottom-nav', className]} aria-label="Main navigation" {...restProps}>
	{#each visibleItems as item, index (item.id)}
		{@const Icon = item.Icon}
		<a
			bind:this={navLinks[index]}
			class={['ui-bottom-nav-item', item.id === activeItem && 'active']}
			href={item.href}
			aria-current={item.id === activeItem ? 'page' : undefined}
			onclick={() => onChangeActiveItem(item.id)}
			onkeydown={(e) => handleKeydown(e, index)}
		>
			<span class="ui-bottom-nav-icon">
				<Icon size={getIconSize('md')} />
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
	}

	.ui-bottom-nav-item:hover:not(.active) {
		color: var(--text-primary);
	}

	.ui-bottom-nav-item.active {
		color: var(--color-primary);
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
