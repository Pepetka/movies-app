export {
	customMovieSchema,
	EMPTY_CUSTOM_MOVIE_FORM,
	validateCustomMovieForm,
	customMovieFormToCreateDto,
	customMovieFormToUpdateDto,
	customMovieFormFromEntity,
	type CustomMovieFormData,
	type CustomMovieFormMode,
	type CustomMovieFormProps
} from './movies.validation.svelte';

export {
	EMPTY_STATUS_FORM,
	MOVIE_STATUS_OPTIONS,
	validateMovieStatusForm,
	movieStatusFormToUpdateDto,
	movieStatusFormFromEntity,
	type MovieStatusFormData
} from './movie-status.validation.svelte';
