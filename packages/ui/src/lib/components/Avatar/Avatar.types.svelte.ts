import type { HTMLAttributes } from 'svelte/elements';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'size'> {
	src?: string;
	name?: string;
	size?: AvatarSize;
	alt?: string;
}
