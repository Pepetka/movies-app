import { z } from 'zod';

import { createValidator } from '$lib/utils/validation.svelte';

export const groupSchema = z.object({
	name: z.string().min(1, 'Обязательное поле').max(100, 'Максимум 100 символов'),
	description: z.string().max(500, 'Максимум 500 символов').optional().or(z.literal('')),
	avatarUrl: z.string().url('Некорректный URL').optional().or(z.literal(''))
});

export type GroupFormData = z.infer<typeof groupSchema>;

export const EMPTY_GROUP_FORM: GroupFormData = {
	name: '',
	description: '',
	avatarUrl: ''
};

export const validateGroupForm = createValidator(groupSchema);
