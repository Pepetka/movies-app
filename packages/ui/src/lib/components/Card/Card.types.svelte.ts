import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLAttributes<HTMLElement>, 'size'> {
	variant?: CardVariant;
	size?: CardSize;
	interactive?: boolean;
	fullWidth?: boolean;
	class?: string;
	children?: Snippet;
}
