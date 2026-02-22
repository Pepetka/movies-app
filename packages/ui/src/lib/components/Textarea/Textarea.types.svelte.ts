import type { HTMLAttributes } from 'svelte/elements';

export interface IProps extends Omit<HTMLAttributes<HTMLTextAreaElement>, 'value' | 'maxlength'> {
	label: string;
	value?: string;
	error?: string;
	helper?: string;
	disabled?: boolean;
	rows?: number;
	maxRows?: number;
	maxLength?: number;
	autoGrow?: boolean;
}
