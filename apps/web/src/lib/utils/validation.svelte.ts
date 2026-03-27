import { SvelteMap } from 'svelte/reactivity';
import { z } from 'zod';

import { DEBOUNCE } from './config';

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface ValidationResult<T> {
	isValid: boolean;
	data: T | null;
	errors: Record<string, string>;
}

export const trimString = (val: string | undefined | null): string => val?.trim() ?? '';

export const trimToUndefined = (val: string | undefined | null): string | undefined => {
	const trimmed = val?.trim();
	return trimmed || undefined;
};

export const zodTrim = z.preprocess((val) => trimString(val as string), z.string());

export const zodTrimOptional = z.preprocess(
	(val) => trimToUndefined(val as string),
	z.string().optional()
);

export const extractZodErrors = (error: z.ZodError): Record<string, string> => {
	const errors = error.flatten().fieldErrors;
	return Object.fromEntries(
		Object.entries(errors).map(([key, value]) => [key, (value as string[] | undefined)?.[0] ?? ''])
	);
};

export const createValidator = <T>(schema: z.ZodSchema<T>) => {
	return (data: unknown): ValidationResult<T> => {
		const result = schema.safeParse(data);
		if (result.success) {
			return { isValid: true, data: result.data, errors: {} };
		}
		return { isValid: false, data: null, errors: extractZodErrors(result.error) };
	};
};

export const createFormFieldValidator = <T extends Record<string, unknown>>(
	validateForm: (data: T) => ValidationResult<T>,
	debounceMs = DEBOUNCE
) => {
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});
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
		if (errors[field]) {
			const currentErrors = { ...errors };
			delete currentErrors[field];
			errors = currentErrors;
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

	const reset = () => {
		cancel();
		errors = {};
		touched = {};
	};

	return {
		get errors() {
			return errors;
		},
		handleFieldChange,
		cancel,
		setErrors,
		reset
	};
};
