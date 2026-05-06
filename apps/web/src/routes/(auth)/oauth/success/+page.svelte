<script lang="ts">
	import { getSafeRedirect, ROUTES } from '$lib/utils';
	import { refreshTokens } from '$lib/modules/auth';
	import { httpClient } from '$lib/api/client';
	import { queryRegistry } from '$lib/query';
	import { goto } from '$app/navigation';

	$effect(() => {
		let cancelled = false;

		const authenticate = async () => {
			try {
				const response = await refreshTokens();
				if (cancelled) return;
				httpClient.setAccessToken(response.accessToken);
				queryRegistry.invalidateByTag('user');
				if (cancelled) return;
				await goto(getSafeRedirect(ROUTES.GROUPS), { replaceState: true });
			} catch {
				if (cancelled) return;
				await goto(`${ROUTES.LOGIN}?oauth_error=1`, { replaceState: true });
			}
		};

		void authenticate();

		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>Завершение входа · Movies App</title>
</svelte:head>

<p aria-live="polite">Завершаем вход...</p>
