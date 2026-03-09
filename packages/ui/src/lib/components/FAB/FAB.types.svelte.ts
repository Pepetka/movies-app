import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type FABSize = 'sm' | 'md' | 'lg' | 'responsive';
export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';
export type FABVariant = 'primary' | 'secondary' | 'ghost';

export type FABOffset = 'default' | 'bottom-nav' | 'above-bottom-nav';

export interface IProps extends Omit<HTMLButtonAttributes, 'size' | 'position'> {
	icon?: Snippet;
	label?: string;
	size?: FABSize;
	position?: FABPosition;
	variant?: FABVariant;
	offset?: FABOffset;
	class?: string;
	children?: Snippet;
}
