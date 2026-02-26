import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ListVariant = 'plain' | 'outlined' | 'filled';

export interface IProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
	dividers?: boolean;
	variant?: ListVariant;
	ordered?: boolean;
	ariaLabel?: string;
	class?: string;
	children?: Snippet;
}
