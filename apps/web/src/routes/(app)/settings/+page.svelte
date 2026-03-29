<script lang="ts">
	import { Button, ThemeToggle, toast } from '@repo/ui';

	import { authStore } from '$lib/modules/auth';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	$effect(() => {
		topBarStore.configure({
			title: 'Настройки'
		});

		return () => topBarStore.destroy();
	});

	const handleLogout = async () => {
		try {
			await authStore.logout();
		} catch {
			toast.error('Ошибка выхода');
		}
		await goto(resolve(ROUTES.HOME), { replaceState: true });
	};
</script>

<svelte:head>
	<title>Настройки · Movies App</title>
</svelte:head>

<div class="settings-page">
	<div class="settings-section">
		<h2>Внешний вид</h2>
		<div class="theme-row">
			<span>Тема</span>
			<ThemeToggle size="sm" />
		</div>
	</div>

	<div class="settings-section">
		<h2>Аккаунт</h2>
		<Button variant="secondary" onclick={handleLogout}>Выйти из аккаунта</Button>
	</div>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-block: var(--space-4);
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		margin-bottom: var(--space-6);
	}

	h2 {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-secondary);
		margin: 0;
	}

	.theme-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background-color: var(--bg-secondary);
		border-radius: var(--radius-lg);
	}
</style>
