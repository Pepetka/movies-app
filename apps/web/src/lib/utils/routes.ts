export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	REGISTER: '/register',
	GROUPS: '/groups',
	GROUPS_NEW: '/groups/new',
	GROUP_DETAIL: (id: number) => `/groups/${String(id)}` as const,
	PROFILE: '/profile',
	SETTINGS: '/settings'
} as const;
