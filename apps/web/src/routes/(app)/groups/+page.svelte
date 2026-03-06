<script lang="ts">
	import { authStore } from '$lib/modules/auth';
</script>

<div class="groups-page">
	<h1>Мои группы</h1>

	{#if authStore.user}
		<p class="welcome">Привет, {authStore.user.name}!</p>
	{/if}

	<p class="empty">У вас пока нет групп. Создайте первую!</p>
</div>

<style>
	.groups-page {
		text-align: center;
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		margin-bottom: var(--space-4);
	}

	.welcome {
		color: var(--text-secondary);
		margin-bottom: var(--space-6);
	}

	.empty {
		color: var(--text-secondary);
	}
</style>
