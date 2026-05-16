import { z } from 'zod';

import { createValidator, trimString, trimToUndefined } from '$lib/utils/validation.svelte';
import type { AuthLoginDto, UserUpdateDto } from '$lib/api/generated/types';
import type { UserResponseDto } from '$lib/api/generated/types';

export const PASSWORD_PATTERNS = {
	lowercase: /[a-z]/,
	uppercase: /[A-Z]/,
	number: /[0-9]/,
	special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
} as const;

export const checkPasswordStrength = (password: string) => ({
	length: password.length >= 8,
	lowercase: PASSWORD_PATTERNS.lowercase.test(password),
	uppercase: PASSWORD_PATTERNS.uppercase.test(password),
	number: PASSWORD_PATTERNS.number.test(password),
	special: PASSWORD_PATTERNS.special.test(password)
});

export const loginSchema = z.object({
	email: z.preprocess(
		(val) => trimString(val as string),
		z.string().min(1, 'Email обязателен').email('Некорректный формат email')
	),
	password: z.string().min(1, 'Пароль обязателен')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const EMPTY_LOGIN_FORM: LoginFormData = {
	email: '',
	password: ''
};

export const validateLoginForm = createValidator(loginSchema);

// === Transformers ===

export const loginFormToDto = (form: LoginFormData): AuthLoginDto => ({
	email: form.email,
	password: form.password
});

// === Profile ===

const optionalUrl = z.preprocess(
	(val) => trimToUndefined(val as string),
	z.string().url('Некорректный URL').optional()
);

export const profileSchema = z.object({
	name: z.preprocess(
		(val) => trimString(val as string),
		z.string().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов')
	),
	avatarUrl: optionalUrl
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const EMPTY_PROFILE_FORM: ProfileFormData = {
	name: '',
	avatarUrl: ''
};

export const validateProfileForm = createValidator(profileSchema);

export const profileFormToDto = (form: ProfileFormData): UserUpdateDto => ({
	name: form.name,
	avatar: form.avatarUrl?.trim() || null
});

export const profileFormFromEntity = (user: UserResponseDto): ProfileFormData => ({
	name: user.name,
	avatarUrl: user.avatar ?? ''
});
