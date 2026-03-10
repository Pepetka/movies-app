import { z } from 'zod';

import { createValidator } from '$lib/utils/validation.svelte';

const optionalUrl = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().url('Некорректный URL').optional()
);

const optionalString = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().max(500, 'Максимум 500 символов').optional()
);

export const groupSchema = z.object({
	name: z.string().min(1, 'Обязательное поле').max(100, 'Максимум 100 символов'),
	description: optionalString,
	avatarUrl: optionalUrl
});

export type GroupFormData = z.infer<typeof groupSchema>;

export const EMPTY_GROUP_FORM: GroupFormData = {
	name: '',
	description: '',
	avatarUrl: ''
};

export const validateGroupForm = createValidator(groupSchema);
