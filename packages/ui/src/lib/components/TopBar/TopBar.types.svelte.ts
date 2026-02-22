import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export interface IProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
	title?: string;
	showBack?: boolean;
	onBack?: () => void;
	leading?: Snippet;
	trailing?: Snippet;
	children?: Snippet;
}
