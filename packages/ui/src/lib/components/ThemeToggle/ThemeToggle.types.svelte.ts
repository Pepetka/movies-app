import type { HTMLAttributes } from 'svelte/elements';

export type ThemeToggleSize = 'sm' | 'md' | 'lg';

export interface ThemeLabels {
	light: string;
	dark: string;
	system: string;
	ariaLabel: string;
}

export interface IProps extends HTMLAttributes<HTMLDivElement> {
	size?: ThemeToggleSize;
	labels?: Partial<ThemeLabels>;
	class?: string;
}
