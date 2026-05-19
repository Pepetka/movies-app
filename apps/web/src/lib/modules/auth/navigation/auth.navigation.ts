import { ROUTES, getSafeRedirect, buildPath } from '$lib/utils';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

import { authStore } from '../stores';

export const requireAuth = (currentUrl?: URL): void => {
	if (!browser || !authStore.isInitialized) return;

	if (authStore.status === 'unauthenticated') {
		const redirect = currentUrl ? `${currentUrl.pathname}${currentUrl.search}` : undefined;
		void goto(buildPath(ROUTES.LOGIN, { redirect }), { replaceState: true });
	}
};

export const redirectIfAuthenticated = (): void => {
	if (!browser || !authStore.isInitialized) return;

	if (authStore.isAuthenticated) {
		void goto(getSafeRedirect(), { replaceState: true });
	}
};
