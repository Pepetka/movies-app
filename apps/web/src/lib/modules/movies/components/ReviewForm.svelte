<script lang="ts">
	import { Button, Textarea } from '@repo/ui';

	import { createFormFieldValidator } from '$lib/utils/validation.svelte';

	import { EMPTY_REVIEW_FORM, validateReviewForm, type ReviewFormProps } from '../validation';
	import StarRatingInput from './StarRatingInput.svelte';

	let {
		form = $bindable({ ...EMPTY_REVIEW_FORM }),
		mode = 'create',
		isSubmitting = false,
		onSubmit,
		onCancel
	}: ReviewFormProps = $props();

	const validator = validateReviewForm;
	const fieldValidator = createFormFieldValidator(validator);

	let ratingError = $state('');

	const handleSubmit = async () => {
		if (isSubmitting) return;

		const result = validator(form);

		if (!result.isValid) {
			fieldValidator.setErrors(result.errors);
			ratingError = result.errors.rating ?? '';
			return;
		}

		ratingError = '';
		await onSubmit?.(form);
	};

	const handleRatingChange = (value: number) => {
		form = { ...form, rating: value };
		ratingError = '';
	};

	$effect(() => {
		return () => {
			fieldValidator.reset();
			ratingError = '';
		};
	});
</script>

<form
	class="review-form"
	onsubmit={(e) => {
		e.preventDefault();
		void handleSubmit();
	}}
>
	<div class="review-form__rating">
		<label class="review-form__label" for="rating-input">Ваша оценка</label>
		<StarRatingInput
			id="rating-input"
			value={form.rating}
			size={36}
			disabled={isSubmitting}
			onChange={handleRatingChange}
		/>
		{#if ratingError}
			<span class="review-form__error">{ratingError}</span>
		{/if}
	</div>

	<Textarea
		label="Отзыв (необязательно)"
		bind:value={form.text}
		maxlength={2000}
		rows={3}
		autoGrow
		helper="Опишите свои впечатления"
		error={fieldValidator.errors.text}
		onChange={() => fieldValidator.handleFieldChange(form, 'text')}
	/>

	<div class="review-form__actions">
		<Button type="submit" loading={isSubmitting}>
			{mode === 'create' ? 'Отправить' : 'Сохранить'}
		</Button>
		{#if mode === 'edit'}
			<Button type="button" variant="secondary" onclick={onCancel} disabled={isSubmitting}
				>Отмена</Button
			>
		{/if}
	</div>
</form>

<style>
	.review-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
	}

	.review-form__rating {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.review-form__label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-secondary);
	}

	.review-form__error {
		font-size: var(--text-xs);
		color: var(--color-error);
	}

	.review-form__actions {
		display: flex;
		gap: var(--space-2);
	}
</style>
