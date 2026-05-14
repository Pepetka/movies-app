import { z } from 'zod';

import type { CreateReviewDto, ReviewResponseDto, UpdateReviewDto } from '$lib/api/generated/types';
import { createValidator, trimToUndefined } from '$lib/utils/validation.svelte';

export const reviewFormSchema = z.object({
	rating: z
		.number()
		.refine(
			(val) => val >= 0.5 && val <= 5.0 && (val * 10) % 5 === 0,
			'Оценка от 0.5 до 5.0 с шагом 0.5'
		),
	text: z.preprocess(
		(val) => trimToUndefined(val as string),
		z.string().max(2000, 'Максимум 2000 символов').optional()
	)
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

export interface ReviewFormProps {
	mode?: 'create' | 'edit';
	isSubmitting?: boolean;
	onSubmit?: () => void | Promise<void>;
	onCancel?: () => void;
	form?: ReviewFormData;
}

export const EMPTY_REVIEW_FORM: ReviewFormData = {
	rating: 0,
	text: ''
};

export const validateReviewForm = createValidator(reviewFormSchema);

export const reviewFormToCreateDto = (form: ReviewFormData): CreateReviewDto => ({
	rating: form.rating,
	text: form.text
});

export const reviewFormToUpdateDto = (form: ReviewFormData): UpdateReviewDto => ({
	rating: form.rating,
	text: form.text
});

export const reviewFormFromEntity = (review: ReviewResponseDto): ReviewFormData => ({
	rating: Number(review.rating),
	text: review.text ?? ''
});
