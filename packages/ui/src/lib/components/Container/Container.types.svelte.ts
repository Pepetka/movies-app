import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	size?: ContainerSize;
	centered?: boolean;
	class?: string;
	children?: Snippet;
}
