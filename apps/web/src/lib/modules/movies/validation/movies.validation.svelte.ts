import type { Icon } from '@lucide/svelte';
import { z } from 'zod';

import type {
	CreateCustomMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto
} from '$lib/api/generated/types';
import { createValidator, trimString, trimToUndefined } from '$lib/utils/validation.svelte';

const currentYear = new Date().getFullYear();

const optionalUrl = z.preprocess(
	(val) => trimToUndefined(val as string),
	z.string().url('Некорректный URL').optional()
);

const optionalString = z.preprocess(
	(val) => trimToUndefined(val as string),
	z.string().max(2000, 'Максимум 2000 символов').optional()
);

const optionalYear = z.preprocess(
	(val) => trimString(val as string),
	z.string().refine(
		(val) => {
			if (val === '') return true;
			const num = Number(val);
			if (Number.isNaN(num)) return false;
			return num >= 1888 && num <= currentYear + 5;
		},
		'Год должен быть от 1888 до ' + (currentYear + 5)
	)
);

const optionalRuntime = z.preprocess(
	(val) => trimString(val as string),
	z.string().refine((val) => {
		if (val === '') return true;
		const num = Number(val);
		if (Number.isNaN(num)) return false;
		return num >= 1 && num <= 600;
	}, 'Длительность должна быть от 1 до 600 минут')
);

export const customMovieFormSchema = z.object({
	title: z.preprocess(
		(val) => trimString(val as string),
		z.string().min(1, 'Обязательное поле').max(255, 'Максимум 255 символов')
	),
	posterPath: optionalUrl,
	overview: optionalString,
	releaseYear: optionalYear,
	runtime: optionalRuntime
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

export const validateCustomMovieForm = createValidator(customMovieFormSchema);

const parseNumberField = (val: string | undefined): number | undefined => {
	if (!val || val === '') return undefined;
	const num = Number(val);
	return Number.isNaN(num) ? undefined : num;
};

export const customMovieFormToCreateDto = (form: CustomMovieFormData): CreateCustomMovieDto => ({
	title: form.title,
	posterPath: trimToUndefined(form.posterPath),
	overview: trimToUndefined(form.overview),
	releaseYear: parseNumberField(form.releaseYear),
	runtime: parseNumberField(form.runtime)
});

export const customMovieFormToUpdateDto = (form: CustomMovieFormData): GroupMovieUpdateDto => ({
	title: form.title || undefined,
	posterPath: trimToUndefined(form.posterPath),
	overview: trimToUndefined(form.overview),
	releaseYear: parseNumberField(form.releaseYear),
	runtime: parseNumberField(form.runtime)
});

export const customMovieFormFromEntity = (movie: GroupMovieResponseDto): CustomMovieFormData => ({
	title: typeof movie.title === 'string' ? movie.title : '',
	posterPath: movie.posterPath ?? '',
	overview: movie.overview ?? '',
	releaseYear: typeof movie.releaseYear === 'number' ? String(movie.releaseYear) : '',
	runtime: typeof movie.runtime === 'number' ? String(movie.runtime) : ''
});
