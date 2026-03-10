import type { HTMLAttributes } from 'svelte/elements';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface IProps extends Omit<HTMLAttributes<HTMLElement>, 'orientation'> {
	orientation?: DividerOrientation;
	inset?: boolean;
	label?: string;
	class?: string;
}
