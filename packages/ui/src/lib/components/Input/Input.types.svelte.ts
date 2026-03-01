import type { HTMLInputAttributes } from 'svelte/elements';
import type { Icon } from '@lucide/svelte';

export type InputSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLInputAttributes, 'size'> {
	size?: InputSize;
	label: string;
	value?: string;
	error?: string;
	helper?: string;
	Icon?: typeof Icon;
	iconAction?: () => void;
	iconLabel?: string;
	onChange?: (value: string) => void;
	class?: string;
}
