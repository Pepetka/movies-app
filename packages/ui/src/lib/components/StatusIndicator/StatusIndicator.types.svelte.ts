import type { HTMLAttributes } from 'svelte/elements';

export type Status = 'loading' | 'online' | 'degraded' | 'offline';
export type StatusIndicatorSize = 'sm' | 'md' | 'lg';

export interface IBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
	status: Status;
	size?: StatusIndicatorSize;
	title?: string;
}

export interface IButtonProps extends IBaseProps {
	onclick?: () => void;
}

export type IProps = IButtonProps;
