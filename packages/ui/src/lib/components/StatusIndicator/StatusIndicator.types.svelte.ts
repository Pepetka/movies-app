import type { HTMLAttributes } from 'svelte/elements';

export type Status = 'loading' | 'online' | 'degraded' | 'offline';
export type StatusIndicatorSize = 'sm' | 'md' | 'lg';

export interface IBaseProps extends HTMLAttributes<HTMLElement> {
	status: Status;
	size?: StatusIndicatorSize;
}

export interface IButtonProps extends IBaseProps {
	onclick?: () => void;
	class?: string;
}

export type IProps = IButtonProps;
