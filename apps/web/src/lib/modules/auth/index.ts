export type { AuthStatus, ValidationResult } from './types';
export type { LoginFormData, RegisterFormData } from './validation.svelte';
export { authStore } from './store.svelte';
export { handleAuthRedirect } from './navigation';
export {
	loginSchema,
	registerSchema,
	validateLoginForm,
	validateRegisterForm,
	checkPasswordStrength,
	createFormFieldValidator
} from './validation.svelte';
