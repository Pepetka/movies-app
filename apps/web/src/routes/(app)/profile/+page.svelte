<script lang="ts">
	import { Avatar } from '@repo/ui';

	import { authStore } from '$lib/modules/auth';
	import { topBarStore } from '$lib/stores';

	$effect(() => {
		topBarStore.configure({
			title: 'Профиль'
		});

		return () => topBarStore.destroy();
	});
</script>

<svelte:head>
	<title>Профиль · Movies App</title>
</svelte:head>

<div class="profile-page">
	{#if authStore.user}
		<div class="user-info">
			<Avatar name={authStore.user.name} size="xl" />
			<p class="name">{authStore.user.name}</p>
			<p class="email">{authStore.user.email}</p>
		</div>
	{:else}
		<p class="empty">Загрузка профиля...</p>
	{/if}
</div>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-block: var(--space-4);
		text-align: center;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.name {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		margin: 0;
	}

	.email {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.empty {
		color: var(--text-secondary);
	}
</style>
