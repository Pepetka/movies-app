import type { Icon } from '@lucide/svelte';
import { z } from 'zod';

import type {
	CreateCustomMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto
} from '$lib/api/generated/types';
import { createValidator } from '$lib/utils/validation.svelte';

const optionalUrl = z
	.string()
	.url('Некорректный URL')
	.transform((val) => (val === '' ? undefined : val))
	.optional()
	.or(z.literal(''));

const optionalString = z
	.string()
	.max(2000, 'Максимум 2000 символов')
	.transform((val) => (val === '' ? undefined : val))
	.optional()
	.or(z.literal(''));

const optionalYear = z
	.string()
	.transform((val) => {
		if (val === '') return undefined;
		const num = Number(val);
		return Number.isNaN(num) ? undefined : num;
	})
	.pipe(
		z
			.number()
			.int()
			.min(1888)
			.max(new Date().getFullYear() + 5)
			.optional()
	);

const optionalRuntime = z
	.string()
	.transform((val) => {
		if (val === '') return undefined;
		const num = Number(val);
		return Number.isNaN(num) ? undefined : num;
	})
	.pipe(z.number().int().min(1).max(600).optional());

export const customMovieFormSchema = z.object({
	title: z.string().min(1, 'Обязательное поле').max(255, 'Максимум 255 символов'),
	posterPath: z.string().optional(),
	overview: z.string().optional(),
	releaseYear: z.string().optional(),
	runtime: z.string().optional()
});

export type CustomMovieFormData = z.infer<typeof customMovieFormSchema>;

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
	releaseYear: '',
	runtime: ''
};

const validationSchema = z.object({
	title: z.string().min(1, 'Обязательное поле').max(255, 'Максимум 255 символов'),
	posterPath: optionalUrl,
	overview: optionalString,
	releaseYear: optionalYear,
	runtime: optionalRuntime
});

export const validateCustomMovieForm = createValidator(validationSchema);

const parseNumberField = (val: string | undefined): number | undefined => {
	if (!val || val === '') return undefined;
	const num = Number(val);
	return Number.isNaN(num) ? undefined : num;
};

export const customMovieFormToCreateDto = (form: CustomMovieFormData): CreateCustomMovieDto => ({
	title: form.title,
	posterPath: form.posterPath || undefined,
	overview: form.overview || undefined,
	releaseYear: parseNumberField(form.releaseYear),
	runtime: parseNumberField(form.runtime)
});

export const customMovieFormToUpdateDto = (form: CustomMovieFormData): GroupMovieUpdateDto => ({
	title: form.title || undefined,
	posterPath: form.posterPath || undefined,
	overview: form.overview || undefined,
	releaseYear: parseNumberField(form.releaseYear),
	runtime: parseNumberField(form.runtime)
});

export const customMovieFormFromEntity = (movie: GroupMovieResponseDto): CustomMovieFormData => ({
	title: typeof movie.title === 'string' ? movie.title : '',
	posterPath: typeof movie.posterPath === 'string' ? movie.posterPath : '',
	overview: typeof movie.overview === 'string' ? movie.overview : '',
	releaseYear: typeof movie.releaseYear === 'number' ? String(movie.releaseYear) : '',
	runtime: typeof movie.runtime === 'number' ? String(movie.runtime) : ''
});
