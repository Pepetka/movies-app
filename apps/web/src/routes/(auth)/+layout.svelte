<script lang="ts">
	import type { Snippet } from 'svelte';

	import { authStore } from '$lib/modules/auth';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();

	$effect(() => {
		if (browser && !authStore.isLoading && authStore.isAuthenticated) {
			void goto(ROUTES.GROUPS, { replaceState: true });
		}
	});
</script>

<div class="auth-layout">
	{@render children()}
</div>

<style>
	.auth-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
	}
</style>
