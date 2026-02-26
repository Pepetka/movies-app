import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLButtonAttributes, 'size'> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	fullWidth?: boolean;
	class?: string;
	children?: Snippet;
}
