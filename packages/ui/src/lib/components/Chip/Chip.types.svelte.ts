import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Icon } from '@lucide/svelte';
import type { Snippet } from 'svelte';

export type ChipSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLButtonAttributes, 'size'> {
	selected?: boolean;
	size?: ChipSize;
	Icon?: typeof Icon;
	onChange?: (selected: boolean) => void;
	class?: string;
	children?: Snippet;
}
