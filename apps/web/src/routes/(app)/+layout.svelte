<script lang="ts">
	import {
		BottomNav,
		Container,
		Dropdown,
		IconButton,
		List,
		ListItem,
		Spinner,
		TopBar
	} from '@repo/ui';
	import { House, MoreVertical, Settings, User } from '@lucide/svelte';
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
	<TopBar
		title={topBarStore.title}
		showBack={topBarStore.showBack}
		onBack={topBarStore.onBack}
		contained
	>
		{#snippet trailing()}
			{#if topBarStore.trailingActions && topBarStore.trailingActions.length > 0}
				<Dropdown position="bottom-end">
					<IconButton Icon={MoreVertical} variant="ghost" label="Действия" />
					{#snippet items()}
						<List variant="plain" style="white-space: nowrap;">
							{#each topBarStore.trailingActions as action (action.label)}
								<ListItem title={action.label} interactive size="sm" onclick={action.onclick}>
									{#snippet leading()}
										<action.Icon size={16} />
									{/snippet}
								</ListItem>
							{/each}
						</List>
					{/snippet}
				</Dropdown>
			{/if}
		{/snippet}
	</TopBar>

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
		padding-top: var(--top-bar-height);
		padding-bottom: var(--bottom-nav-height);
	}

	main {
		flex: 1;
	}
</style>
