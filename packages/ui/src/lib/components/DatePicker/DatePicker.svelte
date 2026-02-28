<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { Calendar, X } from '@lucide/svelte';

	import { useDateFormatter, useCalendarLogic, useKeyboardNavigation } from './hooks';
	import { DatePickerNavigation, DatePickerGrid } from './components';
	import type { IProps } from './DatePicker.types.svelte';
	import { getIconSize } from '../../utils/size';

	let {
		label,
		value = $bindable(null),
		size = 'md',
		disabled = false,
		error = false,
		errorMessage,
		helper,
		minDate,
		maxDate,
		disabledDates = [],
		disabledDaysOfWeek = [],
		locale = 'ru-RU',
		firstDayOfWeek = 1,
		weekendDays = [0, 6],
		clearable = false,
		placeholder = 'dd.mm.yyyy',
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	const inputId = crypto.randomUUID();
	const errorId = crypto.randomUUID();
	const helperId = crypto.randomUUID();
	const popoverId = crypto.randomUUID();

	let isOpen = $state(false);
	let isFocused = $state(false);
	let isHovered = $state(false);
	let containerRef = $state.raw<HTMLDivElement | null>(null);
	let popoverRef = $state.raw<HTMLDivElement | null>(null);
	let focusedDate = $state(new Date());

	const today = new SvelteDate();
	today.setHours(0, 0, 0, 0);

	let currentMonth = $state(today.getMonth());
	let currentYear = $state(today.getFullYear());

	$effect(() => {
		if (value) {
			currentMonth = value.getMonth();
			currentYear = value.getFullYear();
		}
	});

	let hasValue = $derived(value !== null && value !== undefined);
	let isLabelFloating = $derived(isFocused || isOpen || hasValue);
	let showClearIcon = $derived(clearable && hasValue && (isHovered || isOpen) && !disabled);

	const dateFormatter = useDateFormatter({
		locale: () => locale,
		firstDayOfWeek: () => firstDayOfWeek,
		weekendDays: () => weekendDays
	});
	const calendarLogic = useCalendarLogic({
		minDate: () => minDate,
		maxDate: () => maxDate,
		disabledDates: () => disabledDates,
		disabledDaysOfWeek: () => disabledDaysOfWeek,
		firstDayOfWeek: () => firstDayOfWeek
	});

	const toggle = () => {
		if (disabled) return;
		isOpen = !isOpen;
		if (isOpen && value) {
			currentMonth = value.getMonth();
			currentYear = value.getFullYear();
			focusedDate = new Date(value);
		} else if (isOpen) {
			focusedDate = new Date(today);
		}
	};

	const selectDate = (day: Date) => {
		if (calendarLogic.isDateDisabled(day)) return;
		value = new Date(day);
		onChange?.(value);
		isOpen = false;
	};

	const { handleKeydown } = useKeyboardNavigation({
		isOpen: () => isOpen,
		focusedDate: () => focusedDate,
		isDateDisabled: calendarLogic.isDateDisabled,
		onSelect: selectDate,
		onClose: () => (isOpen = false),
		onMonthChange: (month, year) => {
			currentMonth = month;
			currentYear = year;
		},
		onFocusedDateChange: (date) => (focusedDate = date),
		onToggle: toggle
	});

	const handleGlobalKeydown = (e: KeyboardEvent) => {
		if (isFocused || isOpen) {
			handleKeydown(e);
		}
	};

	const clear = (e: Event) => {
		e.stopPropagation();
		value = null;
		onChange?.(null);
	};

	const prevMonth = () => {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear--;
		} else {
			currentMonth--;
		}
		focusedDate = new Date(currentYear, currentMonth, 1);
	};

	const nextMonth = () => {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear++;
		} else {
			currentMonth++;
		}
		focusedDate = new Date(currentYear, currentMonth, 1);
	};

	const prevYear = () => {
		currentYear--;
		focusedDate = new Date(currentYear, currentMonth, 1);
	};

	const nextYear = () => {
		currentYear++;
		focusedDate = new Date(currentYear, currentMonth, 1);
	};

	const handleClickOutside = (e: MouseEvent) => {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			isOpen = false;
		}
	};

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			popoverRef?.focus();
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	const weekdays = $derived(dateFormatter.getWeekdays());
	const weeks = $derived(calendarLogic.getCalendarGrid(currentYear, currentMonth));
	const monthTitle = $derived(dateFormatter.formatMonthYear(currentYear, currentMonth));
	const formattedValue = $derived(dateFormatter.formatDate(value));
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div
	bind:this={containerRef}
	class={['ui-datepicker-wrapper', size, { error, disabled, open: isOpen }, className]}
>
	<div
		class="ui-datepicker-container"
		role="presentation"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<input
			id={inputId}
			readonly
			value={formattedValue}
			{placeholder}
			{disabled}
			aria-invalid={!!error}
			aria-errormessage={errorId}
			aria-describedby={helper ? helperId : undefined}
			aria-expanded={isOpen}
			aria-haspopup="dialog"
			aria-controls={popoverId}
			onclick={toggle}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			{...restProps}
		/>
		<label
			for={inputId}
			class={[
				'ui-datepicker-label',
				{ floating: isLabelFloating, focused: isFocused || isOpen, error }
			]}
		>
			{label}
		</label>
		<button
			type="button"
			class="ui-datepicker-icon"
			class:clearable={showClearIcon}
			onclick={showClearIcon ? clear : toggle}
			aria-label={showClearIcon ? 'Очистить дату' : 'Открыть календарь'}
			{disabled}
			tabindex="-1"
		>
			{#if showClearIcon}
				<X size={getIconSize(size)} />
			{:else}
				<Calendar size={getIconSize(size)} />
			{/if}
		</button>
	</div>

	{#if error && errorMessage}
		<div id={errorId} class="ui-datepicker-message error">
			{errorMessage}
		</div>
	{:else if helper}
		<div id={helperId} class="ui-datepicker-message">
			{helper}
		</div>
	{/if}

	{#if isOpen}
		<div
			bind:this={popoverRef}
			id={popoverId}
			class="ui-datepicker-popover"
			role="dialog"
			aria-modal="true"
			aria-label="Выбор даты"
			tabindex="-1"
		>
			<DatePickerNavigation
				{monthTitle}
				onPrevYear={prevYear}
				onPrevMonth={prevMonth}
				onNextMonth={nextMonth}
				onNextYear={nextYear}
			/>

			<DatePickerGrid
				{weekdays}
				{weeks}
				{currentMonth}
				selectedDate={value}
				{today}
				{focusedDate}
				{locale}
				{weekendDays}
				onSelectDate={selectDate}
				isDateDisabled={calendarLogic.isDateDisabled}
				isSameDay={calendarLogic.isSameDay}
				isOtherMonth={calendarLogic.isOtherMonth}
			/>
		</div>
	{/if}
</div>

<style>
	.ui-datepicker-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		position: relative;
	}

	.ui-datepicker-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	/* Base input styles */
	.ui-datepicker-container input {
		width: 100%;
		height: var(--input-md-height);
		padding: var(--input-md-padding);
		padding-right: 44px;
		font-family: inherit;
		font-size: 16px;
		line-height: 1.5;
		color: var(--text-primary);
		background-color: var(--input-bg);
		border: var(--border-width-thin) solid var(--input-border);
		border-radius: var(--radius-input);
		outline: none;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	/* Hide placeholder */
	.ui-datepicker-container input::placeholder {
		color: transparent;
		pointer-events: none;
		-webkit-user-select: none;
		user-select: none;
	}

	.ui-datepicker-container input:focus::placeholder {
		color: var(--text-tertiary);
	}

	.ui-datepicker-wrapper.open .ui-datepicker-container input::placeholder {
		color: var(--text-tertiary);
	}

	/* Hover state */
	@media (hover: hover) {
		.ui-datepicker-wrapper:not(.open)
			.ui-datepicker-container
			input:hover:not(:disabled):not(:focus) {
			border-color: var(--text-tertiary);
		}
	}

	/* Focus state */
	.ui-datepicker-container input:focus {
		border-color: var(--color-primary);
	}

	/* Open state */
	.ui-datepicker-wrapper.open .ui-datepicker-container input {
		border-color: var(--color-primary);
	}

	/* Disabled */
	.ui-datepicker-container input:disabled {
		background-color: var(--bg-tertiary);
		color: var(--text-tertiary);
		cursor: not-allowed;
	}

	.ui-datepicker-container input:disabled + .ui-datepicker-label {
		background: linear-gradient(to bottom, transparent 50%, var(--bg-tertiary) 50%);
	}

	/* Floating label */
	.ui-datepicker-label {
		position: absolute;
		left: var(--input-md-padding-x);
		top: 50%;
		transform: translateY(-50%);
		font-size: 18px;
		font-weight: 400;
		color: var(--text-tertiary);
		background: linear-gradient(to bottom, transparent 50%, var(--input-bg) 50%);
		padding: 0;
		pointer-events: none;
		transition:
			top 0.2s ease,
			transform 0.2s ease,
			font-size 0.2s ease,
			color 0.2s ease,
			background 0.2s ease,
			padding 0.2s ease;
		transform-origin: left center;
	}

	.ui-datepicker-label.floating {
		top: 0;
		transform: translateY(-50%) scale(0.92);
		font-size: 13px;
		color: var(--text-secondary);
		padding: 0 4px;
	}

	.ui-datepicker-label.focused {
		color: var(--color-primary);
	}

	/* Calendar icon button */
	.ui-datepicker-icon {
		position: absolute;
		right: var(--input-md-padding-x);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		border-radius: 8px;
		color: var(--text-tertiary);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	@media (hover: hover) {
		.ui-datepicker-icon.clearable:hover:not(:disabled) {
			background-color: var(--bg-tertiary);
			color: var(--text-secondary);
		}
	}

	.ui-datepicker-icon:active:not(:disabled) {
		transform: scale(0.92);
	}

	.ui-datepicker-icon:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-datepicker-icon:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Helper / Error message */
	.ui-datepicker-message {
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-tertiary);
		padding-left: 4px;
	}

	.ui-datepicker-message.error {
		color: var(--color-error);
	}

	/* Error state */
	.ui-datepicker-wrapper.error .ui-datepicker-container input {
		border-color: var(--color-error);
	}

	.ui-datepicker-wrapper.error .ui-datepicker-container input:focus {
		border-color: var(--color-error);
	}

	.ui-datepicker-wrapper.error .ui-datepicker-label {
		color: var(--color-error);
	}

	.ui-datepicker-wrapper.error .ui-datepicker-label.focused {
		color: var(--color-error);
	}

	/* Popover */
	.ui-datepicker-popover {
		position: absolute;
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		width: var(--datepicker-width);
		background-color: var(--bg-primary);
		border: var(--border-width-thin) solid var(--border-primary);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		padding: calc(var(--space-2) - 1px);
		z-index: var(--z-popover);
	}

	/* Calendar grid */
	.ui-datepicker-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	/* Small size */
	.ui-datepicker-wrapper.sm .ui-datepicker-container input {
		height: var(--input-sm-height);
		padding: var(--input-sm-padding);
		padding-right: 40px;
		font-size: 14px;
	}

	.ui-datepicker-wrapper.sm .ui-datepicker-label {
		left: var(--input-sm-padding-x);
		font-size: 16px;
	}

	.ui-datepicker-wrapper.sm .ui-datepicker-label.floating {
		font-size: 12px;
	}

	.ui-datepicker-wrapper.sm .ui-datepicker-icon {
		right: 8px;
		width: 28px;
		height: 28px;
	}

	/* Large size */
	.ui-datepicker-wrapper.lg .ui-datepicker-container input {
		height: var(--input-lg-height);
		padding: var(--input-lg-padding);
		padding-right: 52px;
		font-size: 18px;
	}

	.ui-datepicker-wrapper.lg .ui-datepicker-label {
		left: var(--input-lg-padding-x);
		font-size: 20px;
	}

	.ui-datepicker-wrapper.lg .ui-datepicker-label.floating {
		font-size: 14px;
	}

	.ui-datepicker-wrapper.lg .ui-datepicker-icon {
		right: 12px;
		width: 36px;
		height: 36px;
	}
</style>
