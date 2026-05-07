// Types
export type { AuthStatus, ValidationResult } from './types';
export type { AuthProvider } from '$lib/api/generated/types';

// API
export { initLinkProvider, refreshTokens, buildOAuthRedirectUrl } from './api';

// Components
export { OAuthSection } from './components';

// Store
export { authStore } from './stores';

// Navigation
export { requireAuth, redirectIfAuthenticated } from './navigation';

// Validation
export {
	validateLoginForm,
	checkPasswordStrength,
	EMPTY_LOGIN_FORM,
	loginFormToDto,
	type LoginFormData
} from './validation';

// Re-export createFormFieldValidator for convenience
export { createFormFieldValidator } from '$lib/utils/validation.svelte';
