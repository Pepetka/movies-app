import type { HTMLAttributes } from 'svelte/elements';
import type { Icon } from '@lucide/svelte';
import type { Snippet } from 'svelte';

export type EmptyStateVariant = 'default' | 'compact' | 'error';
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	variant?: EmptyStateVariant;
	size?: EmptyStateSize;
	Icon?: typeof Icon;
	title?: string;
	description?: string;
	action?: Snippet;
}
