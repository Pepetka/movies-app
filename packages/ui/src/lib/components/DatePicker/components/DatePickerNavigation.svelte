<script lang="ts">
	import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/svelte';

	interface Props {
		monthTitle: string;
		onPrevYear: () => void;
		onPrevMonth: () => void;
		onNextMonth: () => void;
		onNextYear: () => void;
	}

	let { monthTitle, onPrevYear, onPrevMonth, onNextMonth, onNextYear }: Props = $props();
</script>

<div class="ui-datepicker-nav">
	<div class="ui-datepicker-nav-group">
		<button type="button" onclick={onPrevYear} aria-label="Предыдущий год">
			<ChevronsLeft size={18} />
		</button>
		<button type="button" onclick={onPrevMonth} aria-label="Предыдущий месяц">
			<ChevronLeft size={18} />
		</button>
	</div>
	<span class="ui-datepicker-month-title">{monthTitle}</span>
	<div class="ui-datepicker-nav-group">
		<button type="button" onclick={onNextMonth} aria-label="Следующий месяц">
			<ChevronRight size={18} />
		</button>
		<button type="button" onclick={onNextYear} aria-label="Следующий год">
			<ChevronsRight size={18} />
		</button>
	</div>
</div>

<style>
	.ui-datepicker-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.ui-datepicker-nav-group {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.ui-datepicker-nav button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.ui-datepicker-nav button:hover {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.ui-datepicker-nav button:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-datepicker-month-title {
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		text-transform: capitalize;
	}
</style>
