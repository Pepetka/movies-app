import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	open?: boolean;
	size?: ModalSize;
	closeOnOverlay?: boolean;
	closeOnEscape?: boolean;
	class?: string;
	onClose?: () => void;
	children?: Snippet;
	header?: Snippet<[close: () => void]>;
	footer?: Snippet<[close: () => void]>;
}
