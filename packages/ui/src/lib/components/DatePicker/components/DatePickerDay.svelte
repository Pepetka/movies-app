<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		day: Date;
		selected?: boolean;
		today?: boolean;
		disabled?: boolean;
		focused?: boolean;
		otherMonth?: boolean;
		ariaLabel: string;
		onclick?: () => void;
		children?: Snippet<[number]>;
	}

	let {
		day,
		selected = false,
		today = false,
		disabled = false,
		focused = false,
		otherMonth = false,
		ariaLabel,
		onclick,
		children
	}: Props = $props();
</script>

<button
	type="button"
	class={[
		'ui-datepicker-day',
		{
			selected,
			today,
			disabled,
			focused,
			'other-month': otherMonth
		}
	]}
	role="gridcell"
	aria-selected={selected}
	aria-disabled={disabled}
	aria-label={ariaLabel}
	{onclick}
	{disabled}
>
	{#if children}
		{@render children(day.getDate())}
	{:else}
		{day.getDate()}
	{/if}
</button>

<style>
	.ui-datepicker-day {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--datepicker-day-size);
		height: var(--datepicker-day-size);
		border: none;
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		font-weight: var(--font-normal);
		color: var(--text-primary);
		background-color: transparent;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.ui-datepicker-day:hover:not(.disabled):not(.selected) {
		background-color: var(--bg-tertiary);
	}

	.ui-datepicker-day.other-month {
		color: var(--text-tertiary);
		opacity: 0.6;
	}

	.ui-datepicker-day.today:not(.selected) {
		border: 1px solid var(--color-primary);
		font-weight: var(--font-medium);
	}

	.ui-datepicker-day.selected {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		font-weight: var(--font-medium);
	}

	.ui-datepicker-day.disabled {
		color: var(--text-tertiary);
		background-color: var(--bg-secondary);
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-datepicker-day.focused:not(.selected):not(.disabled) {
		background-color: var(--bg-tertiary);
		box-shadow: inset 0 0 0 2px var(--color-primary);
	}

	.ui-datepicker-day:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
