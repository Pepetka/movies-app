import type { HTMLButtonAttributes } from 'svelte/elements';

export type ThemeButtonSize = 'sm' | 'md' | 'lg';

export interface IProps extends HTMLButtonAttributes {
	size?: ThemeButtonSize;
	labelEnableLight?: string;
	labelEnableDark?: string;
	titleLight?: string;
	titleDark?: string;
}
