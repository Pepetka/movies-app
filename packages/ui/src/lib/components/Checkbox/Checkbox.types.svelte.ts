import type { HTMLInputAttributes } from 'svelte/elements';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLInputAttributes, 'size'> {
	label?: string;
	checked?: boolean;
	disabled?: boolean;
	size?: CheckboxSize;
	helper?: string;
	error?: string;
	indeterminate?: boolean;
	onChange?: (checked: boolean) => void;
	class?: string;
}
