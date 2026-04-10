import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

import type { ModalSize } from '../Modal/Modal.types.svelte';

export type SheetSize = ModalSize;

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	open?: boolean;
	size?: SheetSize;
	closeOnOverlay?: boolean;
	closeOnEscape?: boolean;
	class?: string;
	onClose?: () => void;
	children?: Snippet;
	header?: Snippet<[close: () => void]>;
	drawerHeader?: Snippet<[close: () => void]>;
	footer?: Snippet<[close: () => void]>;
}
