import { ROUTES, getSafeRedirect } from '$lib/utils';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

import { authStore } from '../stores';

export const requireAuth = (): void => {
	if (!browser || !authStore.isInitialized) return;

	if (authStore.status === 'unauthenticated') {
		void goto(ROUTES.LOGIN, { replaceState: true });
	}
};

export const redirectIfAuthenticated = (): void => {
	if (!browser || !authStore.isInitialized) return;

	if (authStore.isAuthenticated) {
		void goto(getSafeRedirect(), { replaceState: true });
	}
};
