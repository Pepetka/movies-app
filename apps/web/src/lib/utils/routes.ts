export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	REGISTER: '/register',
	GROUPS: '/groups',
	GROUPS_NEW: '/groups/new',
	GROUP_DETAIL: (id: number) => `/groups/${String(id)}` as const,
	GROUP_EDIT: (id: number) => `/groups/${String(id)}/edit` as const,
	GROUP_MOVIES_SEARCH: (id: number) => `/groups/${String(id)}/movies/search` as const,
	GROUP_MOVIE_DETAIL: (groupId: number, movieId: number) =>
		`/groups/${String(groupId)}/movies/${String(movieId)}` as const,
	GROUP_MOVIE_EDIT: (groupId: number, movieId: number) =>
		`/groups/${String(groupId)}/movies/${String(movieId)}/edit` as const,
	PROFILE: '/profile',
	SETTINGS: '/settings'
} as const;
