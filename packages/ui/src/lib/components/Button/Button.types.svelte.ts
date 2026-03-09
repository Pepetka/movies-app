import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'responsive';

interface BaseProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	fullWidth?: boolean;
	children?: Snippet;
}

export interface ButtonProps extends BaseProps, Omit<HTMLButtonAttributes, 'size'> {
	href?: undefined;
}

export interface LinkProps extends BaseProps, Omit<HTMLAnchorAttributes, 'size'> {
	href: string;
}

export type IProps = ButtonProps | LinkProps;
