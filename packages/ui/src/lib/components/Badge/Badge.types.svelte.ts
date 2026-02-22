import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export interface IProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	variant?: BadgeVariant;
	size?: BadgeSize;
	children?: Snippet;
}
