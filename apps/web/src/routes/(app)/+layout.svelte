<script lang="ts">
	import { House, Settings, User } from '@lucide/svelte';
	import { BottomNav, Spinner } from '@repo/ui';
	import type { Snippet } from 'svelte';

	import { authStore } from '$lib/modules/auth';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();

	const navItems = $derived([
		{
			id: 'groups',
			label: 'Группы',
			Icon: House,
			href: ROUTES.GROUPS,
			disabled: authStore.isLoading
		},
		{
			id: 'profile',
			label: 'Профиль',
			Icon: User,
			href: ROUTES.PROFILE,
			disabled: authStore.isLoading
		},
		{
			id: 'settings',
			label: 'Настройки',
			Icon: Settings,
			href: ROUTES.SETTINGS,
			disabled: authStore.isLoading
		}
	]);

	const activeNavId = $derived(navItems.find((item) => page.url.pathname === item.href)?.id ?? '');

	$effect(() => {
		if (browser && !authStore.isLoading && authStore.status === 'unauthenticated') {
			void goto(ROUTES.LOGIN, { replaceState: true });
		}
	});
</script>

<div class="app-layout">
	<main>
		{#if authStore.isLoading}
			<div class="loading">
				<Spinner size="lg" />
			</div>
		{:else if authStore.isAuthenticated}
			{@render children()}
		{/if}
	</main>
	<BottomNav items={navItems} value={activeNavId} />
</div>

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		padding-top: var(--space-16);
	}

	.app-layout {
		display: flex;
		flex-direction: column;
		padding-bottom: 80px;
	}

	main {
		flex: 1;
	}
</style>
