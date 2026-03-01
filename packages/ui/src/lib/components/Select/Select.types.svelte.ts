import type { HTMLSelectAttributes } from 'svelte/elements';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface Option {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface IProps extends Omit<HTMLSelectAttributes, 'size'> {
	label: string;
	options: Option[];
	value?: string;
	placeholder?: string;
	error?: string;
	helper?: string;
	disabled?: boolean;
	size?: SelectSize;
	onChange?: (value: string) => void;
	class?: string;
}
