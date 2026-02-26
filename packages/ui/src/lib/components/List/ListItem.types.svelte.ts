import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ListItemSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onclick'> {
	interactive?: boolean;
	disabled?: boolean;
	size?: ListItemSize;
	leading?: Snippet;
	title?: string;
	subtitle?: string;
	description?: string;
	trailing?: Snippet;
	showChevron?: boolean;
	onclick?: (event: MouseEvent) => void;
	class?: string;
	children?: Snippet;
}
