export interface KeyboardNavigationOptions {
	isOpen?: () => boolean;
	focusedDate?: () => Date;
	isDateDisabled?: (date: Date) => boolean;
	onSelect?: (date: Date) => void;
	onClose?: () => void;
	onMonthChange?: (month: number, year: number) => void;
	onFocusedDateChange?: (date: Date) => void;
	onToggle?: () => void;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
	const findNextEnabledDate = (startDate: Date, direction: number, step: number): Date => {
		const maxIterations = 366 * 3;
		const currentDate = new Date(startDate);
		for (let i = 0; i < maxIterations; i++) {
			currentDate.setDate(currentDate.getDate() + direction * step);
			if (!options.isDateDisabled?.(currentDate)) {
				return new Date(currentDate);
			}
		}
		return startDate;
	};

	const findClosestEnabledDate = (targetDate: Date): Date => {
		if (!options.isDateDisabled?.(targetDate)) {
			return new Date(targetDate);
		}
		const forward = findNextEnabledDate(targetDate, 1, 1);
		const backward = findNextEnabledDate(targetDate, -1, 1);
		const forwardDiff = Math.abs(forward.getTime() - targetDate.getTime());
		const backwardDiff = Math.abs(backward.getTime() - targetDate.getTime());
		return forwardDiff <= backwardDiff ? forward : backward;
	};

	const syncMonthYear = (date: Date) => {
		options.onMonthChange?.(date.getMonth(), date.getFullYear());
	};

	const handleKeydown = (e: KeyboardEvent) => {
		const isOpen = options.isOpen?.() ?? false;
		const focusedDate = options.focusedDate?.() ?? new Date();

		if (!isOpen) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				options.onToggle?.();
			}
			return;
		}

		const currentFocused = new Date(focusedDate);
		let nextDate: Date;

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				options.onClose?.();
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (!options.isDateDisabled?.(currentFocused)) {
					options.onSelect?.(currentFocused);
				}
				break;
			case 'ArrowLeft':
				e.preventDefault();
				nextDate = findNextEnabledDate(currentFocused, -1, 1);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'ArrowRight':
				e.preventDefault();
				nextDate = findNextEnabledDate(currentFocused, 1, 1);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'ArrowUp':
				e.preventDefault();
				nextDate = findNextEnabledDate(currentFocused, -1, 7);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'ArrowDown':
				e.preventDefault();
				nextDate = findNextEnabledDate(currentFocused, 1, 7);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'Home':
				e.preventDefault();
				currentFocused.setDate(1);
				nextDate = findClosestEnabledDate(currentFocused);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'End':
				e.preventDefault();
				currentFocused.setMonth(currentFocused.getMonth() + 1, 0);
				nextDate = findClosestEnabledDate(currentFocused);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'PageUp':
				e.preventDefault();
				currentFocused.setMonth(currentFocused.getMonth() - 1);
				nextDate = findClosestEnabledDate(currentFocused);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
			case 'PageDown':
				e.preventDefault();
				currentFocused.setMonth(currentFocused.getMonth() + 1);
				nextDate = findClosestEnabledDate(currentFocused);
				options.onFocusedDateChange?.(nextDate);
				syncMonthYear(nextDate);
				break;
		}
	};

	return {
		handleKeydown,
		findNextEnabledDate
	};
};
