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
		plannedDate: z.date().nullable(),
		watchedDate: z.date().nullable()
	})
	.refine((data) => data.status !== 'planned' || data.plannedDate, {
		message: 'Укажите дату просмотра',
		path: ['plannedDate']
	})
	.refine((data) => data.status !== 'watched' || data.watchedDate, {
		message: 'Укажите дату просмотра',
		path: ['watchedDate']
	});

export type MovieStatusFormData = z.infer<typeof movieStatusSchema>;

export const EMPTY_STATUS_FORM: MovieStatusFormData = {
	status: 'tracking',
	plannedDate: null,
	watchedDate: null
};

export const validateMovieStatusForm = createValidator(movieStatusSchema);

export const movieStatusFormToUpdateDto = (form: MovieStatusFormData): GroupMovieUpdateDto => {
	const dto: GroupMovieUpdateDto = { status: form.status };

	if (form.status === 'planned' && form.plannedDate) {
		dto.plannedDate = form.plannedDate.toISOString();
	}
	if (form.status === 'watched' && form.watchedDate) {
		dto.watchedDate = form.watchedDate.toISOString();
	}

	return dto;
};

export const movieStatusFormFromEntity = (movie: {
	status: MovieStatus;
	plannedDate?: string;
	watchedDate?: string;
}): MovieStatusFormData => ({
	status: movie.status,
	plannedDate: movie.plannedDate ? new SvelteDate(movie.plannedDate) : null,
	watchedDate: movie.watchedDate ? new SvelteDate(movie.watchedDate) : null
});
