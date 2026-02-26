import type { HTMLTextareaAttributes } from 'svelte/elements';

export interface IProps extends Omit<HTMLTextareaAttributes, 'value'> {
	label: string;
	value?: string;
	error?: string;
	helper?: string;
	disabled?: boolean;
	rows?: number;
	maxRows?: number;
	autoGrow?: boolean;
	onChange?: (value: string) => void;
	class?: string;
}
