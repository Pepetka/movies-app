<script lang="ts">
	import DatePickerDay from './DatePickerDay.svelte';

	interface WeekdayInfo {
		short: string;
		full: string;
	}

	interface Props {
		weekdays: WeekdayInfo[];
		weeks: Date[][];
		currentMonth: number;
		selectedDate: Date | null;
		today: Date;
		focusedDate: Date;
		locale: string;
		onSelectDate: (date: Date) => void;
		isDateDisabled: (date: Date) => boolean;
		isSameDay: (a: Date | null, b: Date | null) => boolean;
		isOtherMonth: (day: Date, month: number) => boolean;
	}

	const {
		weekdays,
		weeks,
		currentMonth,
		selectedDate,
		today,
		focusedDate,
		locale,
		onSelectDate,
		isDateDisabled,
		isSameDay,
		isOtherMonth
	}: Props = $props();

	const formatDayAriaLabel = (day: Date): string => {
		return day.toLocaleDateString(locale, {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};
</script>

<div class="ui-datepicker-calendar" role="grid" aria-label="Календарь">
	<div class="ui-datepicker-weekdays" role="row">
		{#each weekdays as day (day.full)}
			<span role="columnheader" aria-label={day.full}>{day.short}</span>
		{/each}
	</div>
	<div class="ui-datepicker-grid">
		{#each weeks as week, weekIndex (weekIndex)}
			<div class="ui-datepicker-week" role="row">
				{#each week as day, dayIndex (dayIndex)}
					{@const isOther = isOtherMonth(day, currentMonth)}
					{@const isSelected = isSameDay(day, selectedDate)}
					{@const isToday = isSameDay(day, today)}
					{@const isDisabled = isDateDisabled(day)}
					{@const isFocusedDay = isSameDay(day, focusedDate)}
					<DatePickerDay
						{day}
						selected={isSelected}
						today={isToday}
						disabled={isDisabled}
						focused={isFocusedDay}
						otherMonth={isOther}
						ariaLabel={formatDayAriaLabel(day)}
						onclick={() => onSelectDate(day)}
					/>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.ui-datepicker-calendar {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.ui-datepicker-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--datepicker-day-gap);
	}

	.ui-datepicker-weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--datepicker-day-gap);
		margin-bottom: var(--space-2);
	}

	.ui-datepicker-weekdays span {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--datepicker-day-size);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--text-tertiary);
		text-transform: capitalize;
	}
</style>
