import type { HTMLAttributes } from 'svelte/elements';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'size'> {
	variant?: SkeletonVariant;
	size?: SkeletonSize;
	width?: string | number;
	height?: string | number;
	rounded?: boolean;
	full?: boolean;
	class?: string;
}
