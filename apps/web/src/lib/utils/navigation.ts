import { page } from '$app/state';

export function withTab(path: string): string {
	const tab = page.url.searchParams.get('tab');
	return tab ? `${path}?tab=${tab}` : path;
}
