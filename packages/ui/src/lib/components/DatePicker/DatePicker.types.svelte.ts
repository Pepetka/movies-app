import type { HTMLInputAttributes } from 'svelte/elements';

export type DatePickerSize = 'sm' | 'md' | 'lg' | 'responsive';

export interface IProps extends Omit<HTMLInputAttributes, 'size' | 'value' | 'type'> {
	label?: string;
	value?: Date | null;
	size?: DatePickerSize;
	disabled?: boolean;
	error?: string;
	helper?: string;
	minDate?: Date;
	maxDate?: Date;
	disabledDates?: Date[];
	disabledDaysOfWeek?: number[];
	locale?: string;
	firstDayOfWeek?: number;
	weekendDays?: number[];
	clearable?: boolean;
	placeholder?: string;
	inline?: boolean;
	onChange?: (value: Date | null) => void;
}
