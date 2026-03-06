<script lang="ts">
	import { authStore } from '$lib/modules/auth';
</script>

<div class="profile-page">
	<h1>Профиль</h1>

	{#if authStore.user}
		<div class="user-info">
			<p class="name">{authStore.user.name}</p>
			<p class="email">{authStore.user.email}</p>
		</div>
	{:else}
		<p class="empty">Загрузка профиля...</p>
	{/if}
</div>

<style>
	.profile-page {
		text-align: center;
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		margin-bottom: var(--space-6);
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.name {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.email {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.empty {
		color: var(--text-secondary);
	}
</style>
