import type { Snippet } from 'svelte';

import type { IProps } from './MovieRating.types';

export type MovieRatingProps = IProps & {
	children?: Snippet;
};
