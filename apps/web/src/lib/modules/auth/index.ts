export type { AuthStatus, ValidationResult } from './types';
export type { LoginFormData, RegisterFormData } from './validation.svelte';
export { authStore } from './store.svelte';
export { requireAuth, redirectIfAuthenticated } from './navigation';
export {
	validateLoginForm,
	validateRegisterForm,
	checkPasswordStrength,
	createFormFieldValidator
} from './validation.svelte';
