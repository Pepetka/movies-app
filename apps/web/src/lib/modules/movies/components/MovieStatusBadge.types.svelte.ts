import type { HTMLAttributes } from 'svelte/elements';

import type { MovieStatus } from '../types';

export interface IProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	status: MovieStatus;
}
