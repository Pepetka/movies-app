import type { HTMLAttributes } from 'svelte/elements';

import type { UnifiedMovie } from '../types';

export interface IProps extends Omit<HTMLAttributes<HTMLElement>, 'onclick'> {
	class?: string;
	movie: UnifiedMovie;
	onclick?: () => void;
}
