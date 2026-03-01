import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type DrawerPosition = 'left' | 'right' | 'bottom';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	open?: boolean;
	position?: DrawerPosition;
	size?: string;
	closeOnOverlay?: boolean;
	closeOnEscape?: boolean;
	class?: string;
	onClose?: () => void;
	children?: Snippet;
	header?: Snippet<[close: () => void]>;
	footer?: Snippet<[close: () => void]>;
}
