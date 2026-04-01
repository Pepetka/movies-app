import { SvelteURLSearchParams } from 'svelte/reactivity';

import { page } from '$app/state';

import { ROUTES, type Route, type RouteValue } from './routes';

export const getSafeRedirect = (fallback: RouteValue = ROUTES.GROUPS): Route => {
	const redirect = page.url.searchParams.get('redirect');
	if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
		return redirect as RouteValue;
	}
	return fallback;
};

export const withCurrentQuery = (path: RouteValue, keys: string[] = []): Route => {
	if (!keys.length) return path;
	const params = new SvelteURLSearchParams();
	for (const key of keys) {
		const value = page.url.searchParams.get(key);
		if (value) params.set(key, value);
	}
	const search = params.toString();
	return search ? `${path}?${search}` : path;
};

export const buildPath = (
	path: RouteValue,
	params?: Record<string, string | null | undefined>
): Route => {
	if (!params) return path;
	const filtered = Object.entries(params).filter((item): item is [string, string] => !!item[1]);
	const searchParams = Object.fromEntries(filtered);
	const search = new SvelteURLSearchParams(searchParams).toString();
	return search ? `${path}?${search}` : path;
};
