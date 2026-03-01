import type { HTMLAttributes } from 'svelte/elements';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'default' | 'light' | 'inherit';

export interface IProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'size'> {
	size?: SpinnerSize;
	variant?: SpinnerVariant;
	label?: string;
	class?: string;
}
