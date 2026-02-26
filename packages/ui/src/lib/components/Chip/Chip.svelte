<script lang="ts">
	import { Check } from '@lucide/svelte';

	import type { IProps, ChipSize } from './Chip.types.svelte';

	const CHIP_ICON_SIZE_MAP: Record<ChipSize, number> = {
		sm: 14,
		md: 16,
		lg: 18
	};

	let {
		selected = $bindable(false),
		size = 'md',
		Icon,
		disabled = false,
		type = 'button',
		onChange,
		onclick,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const showCheckIcon = $derived(selected && !Icon);
	const chipIconSize = $derived(CHIP_ICON_SIZE_MAP[size]);

	const handleClick = (e: MouseEvent) => {
		if (disabled) return;
		selected = !selected;
		onChange?.(selected);
		onclick?.(e as MouseEvent & { currentTarget: EventTarget & HTMLButtonElement });
	};
</script>

<button
	{type}
	class={['ui-chip', size, selected && 'selected', className]}
	{disabled}
	aria-pressed={selected}
	onclick={handleClick}
	{...restProps}
>
	{#if showCheckIcon}
		<span class="ui-chip-icon">
			<Check size={chipIconSize} absoluteStrokeWidth />
		</span>
	{:else if Icon}
		<span class="ui-chip-icon">
			<Icon size={chipIconSize} absoluteStrokeWidth />
		</span>
	{/if}
	{#if children}
		<span class="ui-chip-label">
			{@render children()}
		</span>
	{/if}
</button>

<style>
	.ui-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: var(--border-width-thin) solid var(--chip-default-border);
		border-radius: var(--radius-full);
		background-color: var(--chip-default-bg);
		color: var(--chip-default-text);
		font-family: inherit;
		font-weight: var(--font-medium);
		line-height: var(--leading-tight);
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out);
	}

	.ui-chip:hover:not(:disabled) {
		background-color: var(--chip-default-hover-bg);
	}

	.ui-chip:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-chip.selected {
		background-color: var(--chip-selected-bg);
		color: var(--chip-selected-text);
		border-color: var(--chip-selected-border);
	}

	.ui-chip.selected:hover:not(:disabled) {
		background-color: var(--chip-selected-hover-bg);
	}

	.ui-chip.sm {
		padding: var(--chip-sm-padding);
		font-size: var(--chip-sm-font);
		min-height: var(--chip-sm-height);
		gap: var(--chip-sm-gap);
	}

	.ui-chip.md {
		padding: var(--chip-md-padding);
		font-size: var(--chip-md-font);
		min-height: var(--chip-md-height);
		gap: var(--chip-md-gap);
	}

	.ui-chip.lg {
		padding: var(--chip-lg-padding);
		font-size: var(--chip-lg-font);
		min-height: var(--chip-lg-height);
		gap: var(--chip-lg-gap);
	}

	.ui-chip-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}

	.ui-chip:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
