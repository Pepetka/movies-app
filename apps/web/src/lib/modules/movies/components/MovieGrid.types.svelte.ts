import type { HTMLAttributes } from 'svelte/elements';

import type { UnifiedMovie } from '../types';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	movies: UnifiedMovie[];
	isLoading?: boolean;
	onMovieClick?: (movie: UnifiedMovie) => void;
}
