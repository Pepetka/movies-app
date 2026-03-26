import type { Icon } from '@lucide/svelte';
import { z } from 'zod';

import type {
	CreateCustomMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto
} from '$lib/api/generated/types';
import { createValidator } from '$lib/utils/validation.svelte';

const currentYear = new Date().getFullYear();

const optionalUrl = z.preprocess(
	(val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
	z.string().url('Некорректный URL').optional()
);

const optionalString = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().max(2000, 'Максимум 2000 символов').optional()
);

const optionalYear = z.string().refine(
	(val) => {
		if (val === '') return true;
		const num = Number(val);
		if (Number.isNaN(num)) return false;
		return num >= 1888 && num <= currentYear + 5;
	},
	'Год должен быть от 1888 до ' + (currentYear + 5)
);

const optionalRuntime = z.string().refine((val) => {
	if (val === '') return true;
	const num = Number(val);
	if (Number.isNaN(num)) return false;
	return num >= 1 && num <= 600;
}, 'Длительность должна быть от 1 до 600 минут');

export const customMovieFormSchema = z.object({
	title: z.string().min(1, 'Обязательное поле').max(255, 'Максимум 255 символов'),
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
	posterPath: undefined,
	overview: undefined,
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
	posterPath: form.posterPath,
	overview: form.overview,
	releaseYear: parseNumberField(form.releaseYear),
	runtime: parseNumberField(form.runtime)
});

export const customMovieFormToUpdateDto = (form: CustomMovieFormData): GroupMovieUpdateDto => ({
	title: form.title || undefined,
	posterPath: form.posterPath,
	overview: form.overview,
	releaseYear: parseNumberField(form.releaseYear),
	runtime: parseNumberField(form.runtime)
});

export const customMovieFormFromEntity = (movie: GroupMovieResponseDto): CustomMovieFormData => ({
	title: typeof movie.title === 'string' ? movie.title : '',
	posterPath: movie.posterPath ?? undefined,
	overview: movie.overview ?? undefined,
	releaseYear: typeof movie.releaseYear === 'number' ? String(movie.releaseYear) : '',
	runtime: typeof movie.runtime === 'number' ? String(movie.runtime) : ''
});
