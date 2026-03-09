import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Icon } from '@lucide/svelte';
import type { Snippet } from 'svelte';

import type { IconSize } from '../../utils/size';

export type IconButtonSize = IconSize;

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary';

export interface IProps extends Omit<HTMLButtonAttributes, 'size'> {
	Icon: typeof Icon;
	label: string;
	size?: IconButtonSize;
	variant?: IconButtonVariant;
	loading?: boolean;
	pressed?: boolean;
	class?: string;
	children?: Snippet;
}
