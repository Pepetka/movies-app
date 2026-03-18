import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { ROUTES } from '$lib/utils';

import { authStore } from '../stores';

export function requireAuth(): void {
	if (!browser || !authStore.isInitialized) return;

	if (authStore.status === 'unauthenticated') {
		void goto(resolve(ROUTES.LOGIN), { replaceState: true });
	}
}

export function redirectIfAuthenticated(): void {
	if (!browser || !authStore.isInitialized) return;

	if (authStore.isAuthenticated) {
		void goto(resolve(ROUTES.GROUPS), { replaceState: true });
	}
}
