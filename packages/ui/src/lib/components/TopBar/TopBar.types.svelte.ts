import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

import type { ContainerSize } from '../Container/Container.types.svelte';

export interface IProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
	title?: string;
	showBack?: boolean;
	onBack?: () => void;
	leading?: Snippet;
	trailing?: Snippet;
	children?: Snippet;
	class?: string;
	contained?: boolean;
	containerSize?: ContainerSize;
}
