import { redirect } from '@sveltejs/kit';

import { ROUTES } from '$lib/utils';

export const load = () => {
	throw redirect(302, `${ROUTES.PROFILE}?linked=1`);
};
