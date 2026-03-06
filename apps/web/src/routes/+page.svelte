<script lang="ts">
	import { Button } from '@repo/ui';

	import { authStore } from '$lib/modules/auth';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	$effect(() => {
		if (browser && !authStore.isLoading && authStore.isAuthenticated) {
			void goto(resolve(ROUTES.GROUPS), { replaceState: true });
		}
	});
</script>

<div class="landing">
	<div class="landing-content">
		<div class="logo">
			<h1>Movies App</h1>
		</div>

		<p class="tagline">Отслеживайте групповые просмотры фильмов вместе с друзьями</p>

		<div class="actions">
			<Button variant="primary" fullWidth href={ROUTES.REGISTER}>Начать</Button>

			<Button variant="ghost" fullWidth href={ROUTES.LOGIN}>Уже есть аккаунт? Войти</Button>
		</div>
	</div>
</div>

<style>
	.landing {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.landing-content {
		text-align: center;
		max-width: 400px;
	}

	.logo {
		margin-bottom: var(--space-6);
	}

	.logo h1 {
		font-size: var(--text-4xl);
		font-weight: var(--font-bold);
	}

	.tagline {
		color: var(--text-secondary);
		font-size: var(--text-lg);
		margin-bottom: var(--space-8);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
