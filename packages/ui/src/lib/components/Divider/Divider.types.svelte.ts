import type { HTMLAttributes } from 'svelte/elements';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface IProps extends Omit<HTMLAttributes<HTMLHRElement>, 'orientation'> {
	orientation?: DividerOrientation;
	inset?: boolean;
	class?: string;
}
