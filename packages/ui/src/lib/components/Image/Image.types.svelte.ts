import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ImageRatio = '1/1' | '4/3' | '16/9' | '2/3' | '3/4';
export type ObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
export type ImageLoading = 'lazy' | 'eager';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	src?: string;
	alt?: string;
	ratio?: ImageRatio;
	width?: string | number;
	height?: string | number;
	objectFit?: ObjectFit;
	rounded?: boolean;
	fallback?: Snippet;
	loading?: ImageLoading;
	skeleton?: boolean;
}
