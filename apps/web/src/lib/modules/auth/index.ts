// Types
export type { AuthStatus, ValidationResult } from './types';
export type { AuthProvider } from './api';

// API
export { initLinkProvider, refreshTokens } from './api';

// Store
export { authStore } from './stores';

// Navigation
export { requireAuth, redirectIfAuthenticated } from './navigation';

// Validation
export {
	validateLoginForm,
	validateRegisterForm,
	checkPasswordStrength,
	EMPTY_LOGIN_FORM,
	EMPTY_REGISTER_FORM,
	loginFormToDto,
	registerFormToDto,
	type LoginFormData,
	type RegisterFormData
} from './validation';

// Re-export createFormFieldValidator for convenience
export { createFormFieldValidator } from '$lib/utils/validation.svelte';
