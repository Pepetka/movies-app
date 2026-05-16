// Types
export type { AuthStatus, ValidationResult } from './types';
export type { AuthProvider } from '$lib/api/generated/types';

// API
export { refreshTokens, buildOAuthRedirectUrl, updateUser } from './api';

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
	type LoginFormData,
	validateProfileForm,
	EMPTY_PROFILE_FORM,
	profileFormToDto,
	profileFormFromEntity,
	type ProfileFormData
} from './validation';

// Re-export createFormFieldValidator for convenience
export { createFormFieldValidator } from '$lib/utils/validation.svelte';
