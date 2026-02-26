export interface CalendarLogicOptions {
	minDate?: () => Date | undefined;
	maxDate?: () => Date | undefined;
	disabledDates?: () => Date[];
	disabledDaysOfWeek?: () => number[];
	firstDayOfWeek?: () => number;
}

export const useCalendarLogic = (options: CalendarLogicOptions) => {
	const normalizeDate = (date: Date): Date => {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	};

	const getCalendarGrid = (year: number, month: number): Date[][] => {
		const firstDayOfWeek = options.firstDayOfWeek?.() ?? 1;
		const weeks: Date[][] = [];
		const firstOfMonth = new Date(year, month, 1);
		const lastOfMonth = new Date(year, month + 1, 0);

		const startDate = new Date(firstOfMonth);
		const dayOfWeek = startDate.getDay();
		const offset = (dayOfWeek - firstDayOfWeek + 7) % 7;
		startDate.setDate(startDate.getDate() - offset);

		while (startDate <= lastOfMonth || weeks.length < 6) {
			const week: Date[] = [];
			for (let i = 0; i < 7; i++) {
				week.push(new Date(startDate));
				startDate.setDate(startDate.getDate() + 1);
			}
			weeks.push(week);
			if (startDate.getMonth() !== month && weeks.length >= 6) break;
		}

		return weeks;
	};

	const isOtherMonth = (day: Date, currentMonth: number): boolean => {
		return day.getMonth() !== currentMonth;
	};

	const isSameDay = (a: Date | null, b: Date | null): boolean => {
		if (!a || !b) return false;
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	};

	const isDateDisabled = (day: Date): boolean => {
		const minDate = options.minDate?.();
		const maxDate = options.maxDate?.();
		const disabledDates = options.disabledDates?.() ?? [];
		const disabledDaysOfWeek = options.disabledDaysOfWeek?.() ?? [];

		const normalizedDay = normalizeDate(day);
		if (minDate && normalizedDay < normalizeDate(minDate)) return true;
		if (maxDate && normalizedDay > normalizeDate(maxDate)) return true;
		if (disabledDaysOfWeek.includes(day.getDay())) return true;
		if (disabledDates.some((d) => isSameDay(d, day))) return true;
		return false;
	};

	return {
		getCalendarGrid,
		isOtherMonth,
		isSameDay,
		isDateDisabled
	};
};
