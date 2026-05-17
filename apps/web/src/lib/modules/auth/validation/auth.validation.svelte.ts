import { z } from 'zod';

import { createValidator, trimString } from '$lib/utils/validation.svelte';
import type { AuthLoginDto } from '$lib/api/generated/types';

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
