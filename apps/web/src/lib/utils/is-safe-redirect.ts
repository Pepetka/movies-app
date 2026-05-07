/**
 * Whitelist of allowed redirect paths.
 *
 * Static paths are matched exactly.
 * RegExp patterns match dynamic segments (numeric IDs, tokens).
 */
const ALLOWED_REDIRECTS: ReadonlyArray<string | RegExp> = [
	// Static routes
	'/',
	'/login',
	'/register',
	'/groups',
	'/groups/new',
	'/profile',
	'/settings',

	// Dynamic routes — groups
	/^\/groups\/\d+$/,
	/^\/groups\/\d+\/edit$/,
	/^\/groups\/\d+\/members$/,
	/^\/groups\/\d+\/movies\/search$/,
	/^\/groups\/\d+\/movies\/new$/,
	/^\/groups\/\d+\/movies\/\d+$/,
	/^\/groups\/\d+\/movies\/\d+\/edit$/,

	// Invite links
	/^\/invite\/[a-zA-Z0-9_-]+$/
];

/**
 * Validates that a redirect path is safe using an application-wide allow-list.
 *
 * Covers:
 * - Only known application routes are accepted
 * - Query strings are ignored for pathname validation
 * - Length limit (DoS protection)
 */
export const isSafeRedirect = (redirect: string): boolean => {
	if (!redirect || typeof redirect !== 'string') return false;
	if (redirect.length === 0 || redirect.length > 2048) return false;

	// Extract pathname — ignore query string for validation
	const pathname = redirect.split('?')[0];

	return ALLOWED_REDIRECTS.some((pattern) => {
		if (typeof pattern === 'string') {
			return pathname === pattern;
		}
		return pattern.test(pathname);
	});
};
