import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type FABSize = 'sm' | 'md' | 'lg';
export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface IProps extends Omit<HTMLButtonAttributes, 'size' | 'position'> {
	icon?: Snippet;
	label?: string;
	size?: FABSize;
	position?: FABPosition;
	class?: string;
	children?: Snippet;
}
