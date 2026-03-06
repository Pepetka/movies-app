<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Spinner } from '@repo/ui';

	import { authStore, redirectIfAuthenticated } from '$lib/modules/auth';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();

	$effect(() => {
		redirectIfAuthenticated();
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
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}
</style>
