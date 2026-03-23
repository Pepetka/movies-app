import type { Icon } from '@lucide/svelte';
import { z } from 'zod';

import type {
	CreateCustomMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto
} from '$lib/api/generated/types';
import { createValidator } from '$lib/utils/validation.svelte';

const optionalUrl = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().url('Некорректный URL').optional()
);

const optionalString = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().max(2000, 'Максимум 2000 символов').optional()
);

const optionalYear = z.preprocess(
	(val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
	z
		.number()
		.int()
		.min(1888)
		.max(new Date().getFullYear() + 5)
		.optional()
);

const optionalRuntime = z.preprocess(
	(val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
	z.number().int().min(1).max(600).optional()
);

export const customMovieSchema = z.object({
	title: z.string().min(1, 'Обязательное поле').max(255, 'Максимум 255 символов'),
	posterPath: optionalUrl,
	overview: optionalString,
	releaseYear: optionalYear,
	runtime: optionalRuntime
});

export type CustomMovieFormData = z.infer<typeof customMovieSchema>;

export type CustomMovieFormMode = 'create' | 'edit';

export interface CustomMovieFormProps {
	mode?: CustomMovieFormMode;
	title?: string;
	subtitle?: string;
	cardTitle?: string;
	cardSubtitle?: string;
	submitLabel?: string;
	submitIcon?: typeof Icon;
	onSubmit?: () => void | Promise<void>;
	form?: CustomMovieFormData;
	isSubmitting?: boolean;
}

export const EMPTY_CUSTOM_MOVIE_FORM: CustomMovieFormData = {
	title: '',
	posterPath: '',
	overview: '',
	releaseYear: undefined,
	runtime: undefined
};

export const validateCustomMovieForm = createValidator(customMovieSchema);

export const customMovieFormToCreateDto = (form: CustomMovieFormData): CreateCustomMovieDto => ({
	title: form.title,
	posterPath: form.posterPath || undefined,
	overview: form.overview || undefined,
	releaseYear: form.releaseYear,
	runtime: form.runtime
});

export const customMovieFormToUpdateDto = (form: CustomMovieFormData): GroupMovieUpdateDto => ({
	title: form.title || undefined,
	posterPath: form.posterPath || undefined,
	overview: form.overview || undefined,
	releaseYear: form.releaseYear,
	runtime: form.runtime
});

export const customMovieFormFromEntity = (movie: GroupMovieResponseDto): CustomMovieFormData => ({
	title: typeof movie.title === 'string' ? movie.title : '',
	posterPath: typeof movie.posterPath === 'string' ? movie.posterPath : '',
	overview: typeof movie.overview === 'string' ? movie.overview : '',
	releaseYear: typeof movie.releaseYear === 'number' ? movie.releaseYear : undefined,
	runtime: typeof movie.runtime === 'number' ? movie.runtime : undefined
});
