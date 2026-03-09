<script lang="ts">
	import { BottomNav, Container, IconButton, Spinner, TopBar } from '@repo/ui';
	import { House, Settings, User } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	import { authStore, requireAuth } from '$lib/modules/auth';
	import { topBarStore } from '$lib/stores';
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
		requireAuth();
	});
</script>

<div class="app-layout">
	{#if topBarStore.isShow}
		<TopBar title={topBarStore.title} contained>
			{#snippet trailing()}
				{#if topBarStore.trailingAction}
					<IconButton
						Icon={topBarStore.trailingAction.Icon}
						label={topBarStore.trailingAction.label}
						onclick={topBarStore.trailingAction.onclick}
					/>
				{/if}
			{/snippet}
		</TopBar>
	{/if}

	{#if !authStore.isInitialized || authStore.isLoading}
		<Container>
			<div class="loading">
				<Spinner size="lg" />
			</div>
		</Container>
	{:else if authStore.isAuthenticated}
		<Container>
			<main>
				{@render children()}
			</main>
		</Container>
	{:else}
		<Container>
			<div class="loading">
				<Spinner size="lg" />
			</div>
		</Container>
	{/if}

	<BottomNav items={navItems} value={activeNavId} contained />
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
		min-height: 100%;
		padding-bottom: 80px;
	}

	main {
		flex: 1;
	}
</style>
