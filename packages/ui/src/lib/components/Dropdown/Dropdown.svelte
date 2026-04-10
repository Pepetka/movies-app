<script lang="ts">
	import { fly } from 'svelte/transition';

	import { autoFocusFirst, getFocusableElements } from '../../utils/focus-trap';
	import { DROPDOWN_FLY } from '../../utils/transitions';
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
	const triggerId = `${dropdownId}-trigger`;

	let isOpen = $state(false);
	let containerRef = $state.raw<HTMLDivElement | null>(null);
	let savedFocusElement = $state.raw<HTMLElement | null>(null);

	const flyParams = $derived(position.startsWith('top') ? DROPDOWN_FLY.top : DROPDOWN_FLY.bottom);

	$effect(() => {
		if (isOpen) {
			savedFocusElement = document.activeElement as HTMLElement;
			const controller = new AbortController();
			document.addEventListener('click', handleClickOutside, {
				signal: controller.signal
			});
			return () => {
				controller.abort();
				savedFocusElement?.focus();
			};
		}
	});

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
		if (closeOnEscape && e.key === 'Escape') {
			close();
		}
	};

	const handleContentClick = () => {
		if (closeOnClick) {
			close();
		}
	};

	const handleContentKeydown = (e: KeyboardEvent) => {
		if (!containerRef) return;

		if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			const menu = containerRef.querySelector('[role="menu"]');
			if (!menu) return;
			const elements = getFocusableElements(menu as HTMLElement);
			if (elements.length === 0) return;

			const activeIdx = elements.indexOf(document.activeElement as HTMLElement);
			let nextIdx: number;
			if (e.key === 'ArrowDown') nextIdx = activeIdx < elements.length - 1 ? activeIdx + 1 : 0;
			else if (e.key === 'ArrowUp') nextIdx = activeIdx > 0 ? activeIdx - 1 : elements.length - 1;
			else if (e.key === 'Home') nextIdx = 0;
			else nextIdx = elements.length - 1;

			elements[nextIdx].focus();
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleContentClick();
		}
	};
</script>

<svelte:window onkeydown={isOpen ? handleKeydown : undefined} />

<div bind:this={containerRef} class={['ui-dropdown', className]} {...restProps}>
	<div
		id={triggerId}
		class="ui-dropdown-trigger"
		role="button"
		onclick={toggle}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggle();
			} else if (e.key === 'ArrowDown' && !isOpen) {
				e.preventDefault();
				toggle();
			}
		}}
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
			aria-labelledby={triggerId}
			tabindex="-1"
			onclick={handleContentClick}
			onkeydown={handleContentKeydown}
			use:autoFocusFirst
			in:fly={flyParams}
			out:fly={flyParams}
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

	/* States */
	.ui-dropdown-trigger:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-dropdown-content :global(button:focus-visible) {
		background-color: var(--bg-secondary);
	}

	@media (hover: hover) {
		.ui-dropdown-content :global(button:hover:not(:disabled)) {
			background-color: var(--bg-secondary);
		}
	}
</style>
