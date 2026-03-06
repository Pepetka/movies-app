<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Spinner } from '@repo/ui';

	import { authStore, handleAuthRedirect } from '$lib/modules/auth';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();

	$effect(() => {
		handleAuthRedirect();
	});
</script>

<div class="auth-layout">
	{#if !authStore.isInitialized}
		<div class="loading">
			<Spinner size="lg" />
		</div>
	{:else if !authStore.isAuthenticated}
		{@render children()}
	{/if}
</div>

<style>
	.auth-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}
</style>
