export const formatDate = (dateStr?: string, format: 'short' | 'long' = 'long'): string => {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return '';
	const options: Intl.DateTimeFormatOptions =
		format === 'short'
			? { day: 'numeric', month: 'short' }
			: { day: 'numeric', month: 'long', year: 'numeric' };
	return date.toLocaleDateString('ru-RU', options);
};

export const formatRuntime = (minutes?: number): string => {
	if (!minutes) return '';
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours === 0) return `${mins} мин`;
	if (mins === 0) return `${hours} ч`;
	return `${hours} ч ${mins} мин`;
};

export const sortByDateField = <T>(
	items: T[],
	field: keyof T & string,
	direction: 'asc' | 'desc' = 'asc'
): T[] => {
	if (items.length <= 1) return items;

	return [...items].sort((a, b) => {
		const aTs = a[field] ? new Date(a[field] as string).getTime() : null;
		const bTs = b[field] ? new Date(b[field] as string).getTime() : null;
		if (aTs === null && bTs === null) return 0;
		if (aTs === null) return 1;
		if (bTs === null) return -1;
		return direction === 'asc' ? aTs - bTs : bTs - aTs;
	});
};
