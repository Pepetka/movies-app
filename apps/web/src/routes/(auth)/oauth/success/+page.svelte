<script lang="ts">
	import { authControllerRefreshV1 } from '$lib/api/generated/api';
	import { httpClient } from '$lib/api/client';
	import { queryRegistry } from '$lib/query';
	import { goto } from '$app/navigation';

	let error = $state<string | null>(null);

	const authentificate = async () => {
		try {
			const response = await authControllerRefreshV1();
			httpClient.setAccessToken(response.accessToken);
			queryRegistry.invalidateByTag('user');
			await goto('/groups', { replaceState: true });
		} catch {
			error = 'Ошибка входа через OAuth';
			await goto('/login?oauth_error=1', { replaceState: true });
		}
	};

	$effect(() => {
		let cancelled = false;
		void authentificate().then(() => {
			if (cancelled) return;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

{#if error}
	<p>{error}</p>
{:else}
	<p>Завершаем вход...</p>
{/if}
