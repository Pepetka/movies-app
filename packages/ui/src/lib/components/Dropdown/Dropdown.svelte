<script lang="ts">
	import { fly } from 'svelte/transition';

	import type { IProps } from './Dropdown.types.svelte';
	import { generateId } from '../../utils/id';

	let {
		position = 'bottom-end',
		closeOnClick = true,
		closeOnEscape = true,
		class: className,
		children,
		items,
		...restProps
	}: IProps = $props();

	const dropdownId = generateId();

	const flyY = $derived(position.startsWith('top') ? 10 : -10);

	let isOpen = $state(false);
	let containerRef = $state.raw<HTMLDivElement | null>(null);

	const toggle = () => {
		isOpen = !isOpen;
	};

	const close = () => {
		isOpen = false;
	};

	const handleClickOutside = (e: MouseEvent) => {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			close();
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (closeOnEscape && isOpen && e.key === 'Escape') {
			close();
		}
	};

	const handleContentClick = () => {
		if (closeOnClick) {
			close();
		}
	};
	$effect(() => {
		if (isOpen) {
			const controller = new AbortController();
			document.addEventListener('click', handleClickOutside, {
				signal: controller.signal
			});
			return () => controller.abort();
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div bind:this={containerRef} class={['ui-dropdown', className]} {...restProps}>
	<div
		class="ui-dropdown-trigger"
		role="button"
		onclick={toggle}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggle() : undefined)}
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-controls={isOpen ? dropdownId : undefined}
		tabindex="0"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if isOpen && items}
		<div
			id={dropdownId}
			class={['ui-dropdown-content', position]}
			role="menu"
			tabindex="-1"
			onclick={handleContentClick}
			onkeydown={handleContentClick}
			in:fly={{ y: flyY, duration: 150 }}
			out:fly={{ y: flyY, duration: 150 }}
		>
			{@render items()}
		</div>
	{/if}
</div>

<style>
	/* Base */
	.ui-dropdown {
		position: relative;
		display: inline-flex;
	}

	/* Trigger */
	.ui-dropdown-trigger {
		display: inline-flex;
		cursor: pointer;
		outline: none;
		border-radius: var(--radius-md);
	}

	.ui-dropdown-trigger:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	/* Content */
	.ui-dropdown-content {
		position: absolute;
		z-index: var(--z-dropdown);
		min-width: 100%;
		background-color: var(--bg-primary);
		border: var(--border-width-thin) solid var(--border-primary);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}

	/* Positions */
	.ui-dropdown-content.bottom-start {
		top: 100%;
		left: 0;
		margin-top: var(--space-1);
	}

	.ui-dropdown-content.bottom-end {
		top: 100%;
		right: 0;
		margin-top: var(--space-1);
	}

	.ui-dropdown-content.top-start {
		bottom: 100%;
		left: 0;
		margin-bottom: var(--space-1);
	}

	.ui-dropdown-content.top-end {
		bottom: 100%;
		right: 0;
		margin-bottom: var(--space-1);
	}
</style>
