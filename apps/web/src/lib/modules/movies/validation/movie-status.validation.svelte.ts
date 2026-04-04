import { SvelteDate } from 'svelte/reactivity';
import { z } from 'zod';

import type { GroupMovieUpdateDto } from '$lib/api/generated/types';
import { createValidator } from '$lib/utils/validation.svelte';

import { getStatusLabel, type MovieStatus } from '../types';

export const MOVIE_STATUS_OPTIONS: { value: MovieStatus; label: string }[] = [
	{ value: 'tracking', label: getStatusLabel('tracking') },
	{ value: 'planned', label: getStatusLabel('planned') },
	{ value: 'watched', label: getStatusLabel('watched') }
] as const;

export const movieStatusSchema = z
	.object({
		status: z.enum(['tracking', 'planned', 'watched']),
		watchDate: z.date().nullable()
	})
	.refine((data) => data.status !== 'planned' || data.watchDate, {
		message: 'Укажите дату просмотра',
		path: ['watchDate']
	})
	.refine((data) => data.status !== 'watched' || data.watchDate, {
		message: 'Укажите дату просмотра',
		path: ['watchDate']
	});

export type MovieStatusFormData = z.infer<typeof movieStatusSchema>;

export const EMPTY_STATUS_FORM: MovieStatusFormData = {
	status: 'tracking',
	watchDate: null
};

export const validateMovieStatusForm = createValidator(movieStatusSchema);

export const movieStatusFormToUpdateDto = (form: MovieStatusFormData): GroupMovieUpdateDto => {
	const dto: GroupMovieUpdateDto = { status: form.status };

	if ((form.status === 'planned' || form.status === 'watched') && form.watchDate) {
		dto.watchDate = form.watchDate.toISOString();
	}

	return dto;
};

export const movieStatusFormFromEntity = (movie: {
	status: MovieStatus;
	watchDate?: string;
}): MovieStatusFormData => ({
	status: movie.status,
	watchDate: movie.watchDate ? new SvelteDate(movie.watchDate) : null
});
