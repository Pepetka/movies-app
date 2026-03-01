import type { HTMLAttributes } from 'svelte/elements';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition =
	| 'bottom-center'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'top-left'
	| 'top-right';

export interface ToastAction {
	label: string;
	onClick: () => void;
}

export interface ToastOptions {
	message: string;
	type?: ToastType;
	duration?: number;
	action?: ToastAction;
	dismissible?: boolean;
}

export interface ToastItem extends Required<Omit<ToastOptions, 'action'>> {
	id: string;
	action?: ToastAction;
}

export interface ToastContainerProps {
	position?: ToastPosition;
	maxToasts?: number;
	class?: string;
}

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
	toast: ToastItem;
	onDismiss: (id: string) => void;
	class?: string;
}
