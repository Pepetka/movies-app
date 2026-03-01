import type { HTMLButtonAttributes } from 'svelte/elements';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface IProps extends Omit<HTMLButtonAttributes, 'size'> {
	label: string;
	checked?: boolean;
	disabled?: boolean;
	size?: SwitchSize;
	helper?: string;
	onChange?: (checked: boolean) => void;
	class?: string;
}
