import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type GridGap = 'sm' | 'md' | 'lg' | 'none';

export type GridCols = number | [number, number, number];

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
	cols?: GridCols;
	gap?: GridGap;
	class?: string;
	children?: Snippet;
	style?: string;
}
