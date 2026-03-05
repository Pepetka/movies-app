import { SvelteMap } from 'svelte/reactivity';
import { z } from 'zod';

import type { ValidationResult } from './types';

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
	email: z.string().min(1, 'Email обязателен').email('Некорректный формат email'),
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
		name: z.string().min(2, 'Минимум 2 символа').max(256, 'Максимум 256 символов'),
		email: z.string().min(1, 'Email обязателен').email('Некорректный формат email'),
		password: passwordSchema,
		confirmPassword: z.string().min(1, 'Подтвердите пароль')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword']
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

const extractErrors = (error: z.ZodError): Record<string, string> => {
	const errors = error.flatten().fieldErrors;
	return Object.fromEntries(
		Object.entries(errors).map(([key, value]) => [key, (value as string[] | undefined)?.[0] ?? ''])
	);
};

const createValidator = <T>(schema: z.ZodSchema<T>) => {
	return (data: unknown): ValidationResult<T> => {
		const result = schema.safeParse(data);
		if (result.success) {
			return { isValid: true, data: result.data, errors: {} };
		}
		return { isValid: false, data: null, errors: extractErrors(result.error) };
	};
};

export const validateLoginForm = createValidator(loginSchema);
export const validateRegisterForm = createValidator(registerSchema);

export const createFormFieldValidator = <T extends Record<string, unknown>>(
	validateForm: (data: T) => ValidationResult<T>,
	debounceMs = 1000
) => {
	let errors = $state.raw<Record<string, string>>({});
	let touched = $state.raw<Record<string, boolean>>({});
	const pendingValidations = new SvelteMap<string, ReturnType<typeof setTimeout>>();

	const validateField = (form: T, field: keyof T & string) => {
		if (!touched[field]) return;
		const result = validateForm(form);
		const currentErrors = { ...errors };
		if (result.errors[field]) {
			currentErrors[field] = result.errors[field];
		} else {
			delete currentErrors[field];
		}
		errors = currentErrors;
	};

	const scheduleValidate = (form: T, field: keyof T & string) => {
		const existing = pendingValidations.get(field);
		if (existing) clearTimeout(existing);
		const timeoutId = setTimeout(() => {
			pendingValidations.delete(field);
			validateField(form, field);
		}, debounceMs);
		pendingValidations.set(field, timeoutId);
	};

	const handleFieldChange = (form: T, field: keyof T & string) => {
		if (!touched[field]) {
			touched = { ...touched, [field]: true };
		}
		scheduleValidate(form, field);
	};

	const cancel = () => {
		for (const timeoutId of pendingValidations.values()) {
			clearTimeout(timeoutId);
		}
		pendingValidations.clear();
	};

	const setErrors = (newErrors: Record<string, string>) => {
		errors = newErrors;
	};

	return {
		get errors() {
			return errors;
		},
		handleFieldChange,
		cancel,
		setErrors
	};
};
