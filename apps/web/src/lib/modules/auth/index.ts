export type { AuthStatus, ValidationResult } from './types';
export type { LoginFormData, RegisterFormData } from './validation.svelte';
export { authStore } from './store.svelte';
export { requireAuth, redirectIfAuthenticated } from './navigation';
export {
	validateLoginForm,
	validateRegisterForm,
	checkPasswordStrength,
	EMPTY_LOGIN_FORM,
	EMPTY_REGISTER_FORM,
	loginFormToDto,
	registerFormToDto
} from './validation.svelte';
export { createFormFieldValidator } from '$lib/utils/validation.svelte';
