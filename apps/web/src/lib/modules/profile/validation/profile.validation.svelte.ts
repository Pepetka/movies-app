import { z } from 'zod';

import { createValidator, trimString, trimToUndefined } from '$lib/utils/validation.svelte';
import type { UserResponseDto, UserUpdateDto } from '$lib/api/generated/types';

// === Schema ===

const optionalUrl = z.preprocess(
	(val) => trimToUndefined(typeof val === 'string' ? val : ''),
	z.string().url('Некорректный URL').max(512, 'Максимум 512 символов').optional()
);

export const profileSchema = z.object({
	name: z.preprocess(
		(val) => trimString(typeof val === 'string' ? val : ''),
		z.string().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов')
	),
	avatarUrl: optionalUrl
});

// === Types ===

export type ProfileFormData = z.infer<typeof profileSchema>;

// === Constants ===

export const EMPTY_PROFILE_FORM: ProfileFormData = {
	name: '',
	avatarUrl: ''
};

// === Validation ===

export const validateProfileForm = createValidator(profileSchema);

// === Transformers ===

export const profileFormToDto = (form: ProfileFormData): UserUpdateDto => ({
	name: form.name,
	avatar: form.avatarUrl || null
});

export const profileFormFromEntity = (user: UserResponseDto): ProfileFormData => ({
	name: user.name,
	avatarUrl: user.avatar ?? ''
});
