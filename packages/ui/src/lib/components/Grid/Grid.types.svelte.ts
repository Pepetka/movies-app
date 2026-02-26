import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type GridGap = 'sm' | 'md' | 'lg' | 'none';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
	cols?: number;
	gap?: GridGap;
	class?: string;
	children?: Snippet;
	style?: string;
}
