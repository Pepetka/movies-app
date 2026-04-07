import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type DropdownPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	position?: DropdownPosition;
	closeOnClick?: boolean;
	closeOnEscape?: boolean;
	children?: Snippet;
	items?: Snippet;
	class?: string;
}
