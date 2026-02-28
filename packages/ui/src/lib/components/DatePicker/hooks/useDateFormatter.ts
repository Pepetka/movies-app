export interface DateFormatterOptions {
	locale?: () => string;
	firstDayOfWeek?: () => number;
	weekendDays?: () => number[];
}

export const useDateFormatter = (options: DateFormatterOptions) => {
	const formatDate = (date: Date | null): string => {
		if (!date) return '';
		const locale = options.locale?.() ?? 'ru-RU';
		return date.toLocaleDateString(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const formatMonthYear = (year: number, month: number): string => {
		const locale = options.locale?.() ?? 'ru-RU';
		const date = new Date(year, month, 1);
		return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
	};

	const getWeekdays = (): { short: string; full: string; isWeekend: boolean }[] => {
		const locale = options.locale?.() ?? 'ru-RU';
		const firstDayOfWeek = options.firstDayOfWeek?.() ?? 1;
		const weekendDays = options.weekendDays?.() ?? [0, 6];
		const weekdays: { short: string; full: string; isWeekend: boolean }[] = [];

		// January 7, 2024 was a Sunday (getDay() = 0)
		const sundayDate = 7;

		for (let i = 0; i < 7; i++) {
			const dayIndex = (firstDayOfWeek + i) % 7;
			// Calculate date for dayIndex: Sunday = 7, Monday = 8, ..., Saturday = 13
			const date = new Date(2024, 0, sundayDate + dayIndex);
			weekdays.push({
				short: date.toLocaleDateString(locale, { weekday: 'short' }),
				full: date.toLocaleDateString(locale, { weekday: 'long' }),
				isWeekend: weekendDays.includes(dayIndex)
			});
		}
		return weekdays;
	};

	return {
		formatDate,
		formatMonthYear,
		getWeekdays
	};
};
