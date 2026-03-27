<script lang="ts">
	import { Button, Card, Input, Textarea, Divider, Image as UIImage } from '@repo/ui';
	import { Film, Image, Clock, Calendar, Save, Sparkles } from '@lucide/svelte';

	import { createFormFieldValidator, type ValidationResult } from '$lib/utils';

	import {
		validateCustomMovieForm,
		EMPTY_CUSTOM_MOVIE_FORM,
		type CustomMovieFormData,
		type CustomMovieFormProps
	} from '../validation';

	import '$lib/styles/movie-form.css';

	let {
		mode = 'create',
		title,
		subtitle,
		cardTitle,
		cardSubtitle,
		submitLabel = mode === 'create' ? 'Создать' : 'Сохранить',
		submitIcon: SubmitIcon = mode === 'create' ? Sparkles : Save,
		onSubmit,
		form = $bindable({ ...EMPTY_CUSTOM_MOVIE_FORM }),
		isSubmitting = false
	}: CustomMovieFormProps = $props();

	const fieldValidator = createFormFieldValidator(
		validateCustomMovieForm as (data: CustomMovieFormData) => ValidationResult<CustomMovieFormData>
	);

	$effect(() => {
		return () => fieldValidator.reset();
	});

	const digitsOnly = (value: string): string => value.replace(/\D/g, '');

	const handleYearChange = (value: string) => {
		form.releaseYear = digitsOnly(value);
		fieldValidator.handleFieldChange(form, 'releaseYear');
	};

	const handleRuntimeChange = (value: string) => {
		form.runtime = digitsOnly(value);
		fieldValidator.handleFieldChange(form, 'runtime');
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (isSubmitting) return;

		const validation = validateCustomMovieForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;
		await onSubmit?.();
	};
</script>

<div class="form-page">
	<div class="form-branding">
		{#if form.posterPath}
			<div class="movie-form-poster-preview">
				<UIImage src={form.posterPath} alt="Превью постера" ratio="2/3" />
			</div>
		{/if}
		<h1 class="form-title">
			{title || (mode === 'create' ? 'Новый фильм' : 'Редактирование')}
		</h1>
		<p class="form-subtitle">
			{subtitle || (mode === 'create' ? 'Добавьте фильм вручную' : 'Измените данные фильма')}
		</p>
	</div>

	<Card variant="outlined" class="form-card">
		{#snippet header()}
			<div class="form-card-header">
				<h2 class="form-card-title">
					{cardTitle || 'Данные фильма'}
				</h2>
				<p class="form-card-subtitle">
					{cardSubtitle || 'Заполните информацию о фильме'}
				</p>
			</div>
		{/snippet}

		<form class="form-fields" onsubmit={handleSubmit}>
			<Input
				type="text"
				label="Название"
				bind:value={form.title}
				error={fieldValidator.errors.title}
				Icon={Film}
				placeholder="Например: Интерстеллар"
				disabled={isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'title')}
			/>

			<Textarea
				bind:value={form.overview}
				label="Описание"
				error={fieldValidator.errors.overview}
				placeholder="О чём этот фильм..."
				rows={3}
				maxlength={2000}
				maxRows={10}
				disabled={isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'overview')}
			/>

			<Divider label="Дополнительно" class="form-divider" />

			<Input
				type="url"
				label="Постер"
				bind:value={form.posterPath}
				error={fieldValidator.errors.posterPath}
				Icon={Image}
				placeholder="https://example.com/poster.jpg"
				disabled={isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'posterPath')}
			/>

			<Input
				type="text"
				label="Год"
				value={form.releaseYear}
				error={fieldValidator.errors.releaseYear}
				Icon={Calendar}
				placeholder="2024"
				maxlength={4}
				disabled={isSubmitting}
				onChange={handleYearChange}
			/>

			<Input
				type="text"
				label="Длительность (мин)"
				value={form.runtime}
				error={fieldValidator.errors.runtime}
				Icon={Clock}
				placeholder="120"
				maxlength={3}
				disabled={isSubmitting}
				onChange={handleRuntimeChange}
			/>

			<Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
				<SubmitIcon size={16} />
				{submitLabel}
			</Button>
		</form>
	</Card>
</div>
