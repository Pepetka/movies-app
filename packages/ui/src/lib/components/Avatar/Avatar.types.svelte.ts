import type { HTMLAttributes } from 'svelte/elements';

export type { AvatarSize } from '../../utils/avatar-size';

export interface IProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'size'> {
	src?: string;
	name?: string;
	size?: import('../../utils/avatar-size').AvatarSize;
	alt?: string;
	skeleton?: boolean;
	loading?: 'lazy' | 'eager';
}
