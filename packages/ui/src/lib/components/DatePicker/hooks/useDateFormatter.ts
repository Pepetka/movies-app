export interface DateFormatterOptions {
	locale?: () => string;
	firstDayOfWeek?: () => number;
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

	const getWeekdays = (): { short: string; full: string }[] => {
		const locale = options.locale?.() ?? 'ru-RU';
		const firstDayOfWeek = options.firstDayOfWeek?.() ?? 1;
		const weekdays: { short: string; full: string }[] = [];
		for (let i = 0; i < 7; i++) {
			const dayIndex = (firstDayOfWeek + i) % 7;
			const date = new Date(2024, 0, dayIndex + 1);
			weekdays.push({
				short: date.toLocaleDateString(locale, { weekday: 'short' }),
				full: date.toLocaleDateString(locale, { weekday: 'long' })
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
