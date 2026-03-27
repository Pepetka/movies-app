import { z } from 'zod';

import type { AuthLoginDto, AuthRegisterDto } from '$lib/api/generated/types';
import { createValidator, trimString } from '$lib/utils/validation.svelte';

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

const passwordSchema = z
	.string()
	.min(8, 'Минимум 8 символов')
	.refine((val) => PASSWORD_PATTERNS.lowercase.test(val), 'Требуется минимум 1 строчная буква')
	.refine((val) => PASSWORD_PATTERNS.uppercase.test(val), 'Требуется минимум 1 заглавная буква')
	.refine((val) => PASSWORD_PATTERNS.number.test(val), 'Требуется минимум 1 цифра')
	.refine((val) => PASSWORD_PATTERNS.special.test(val), 'Требуется минимум 1 специальный символ');

export const registerSchema = z
	.object({
		name: z.preprocess(
			(val) => trimString(val as string),
			z.string().min(2, 'Минимум 2 символа').max(256, 'Максимум 256 символов')
		),
		email: z.preprocess(
			(val) => trimString(val as string),
			z.string().min(1, 'Email обязателен').email('Некорректный формат email')
		),
		password: passwordSchema,
		confirmPassword: z.string().min(1, 'Подтвердите пароль')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword']
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const EMPTY_LOGIN_FORM: LoginFormData = {
	email: '',
	password: ''
};

export const EMPTY_REGISTER_FORM: RegisterFormData = {
	name: '',
	email: '',
	password: '',
	confirmPassword: ''
};

export const validateLoginForm = createValidator(loginSchema);
export const validateRegisterForm = createValidator(registerSchema);

// === Transformers ===

export const loginFormToDto = (form: LoginFormData): AuthLoginDto => ({
	email: form.email,
	password: form.password
});

export const registerFormToDto = (form: RegisterFormData): AuthRegisterDto => ({
	name: form.name,
	email: form.email,
	password: form.password
});
