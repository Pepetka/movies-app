import type { HTMLInputAttributes } from 'svelte/elements';

export type DatePickerSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLInputAttributes, 'size' | 'value' | 'type'> {
	label: string;
	value?: Date | null;
	size?: DatePickerSize;
	disabled?: boolean;
	error?: boolean;
	errorMessage?: string;
	helper?: string;
	minDate?: Date;
	maxDate?: Date;
	disabledDates?: Date[];
	disabledDaysOfWeek?: number[];
	locale?: string;
	firstDayOfWeek?: number;
	clearable?: boolean;
	placeholder?: string;
	onChange?: (value: Date | null) => void;
}
