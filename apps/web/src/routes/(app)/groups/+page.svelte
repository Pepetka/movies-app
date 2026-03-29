<script lang="ts">
	import { Avatar, Button, EmptyState, FAB, List, ListItem, Skeleton, Spinner } from '@repo/ui';
	import { Plus, Users } from '@lucide/svelte';

	import { groupsStore } from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	const handleCreateGroup = () => {
		void goto(resolve(ROUTES.GROUPS_NEW));
	};

	const handleGroupClick = (groupId: number) => {
		void goto(resolve(ROUTES.GROUP_DETAIL(groupId)));
	};

	$effect(() => {
		topBarStore.configure({
			title: 'Мои группы'
		});

		return () => topBarStore.destroy();
	});

	$effect(() => {
		void groupsStore.fetchGroups();
	});
</script>

<svelte:head>
	<title>Мои группы · Movies App</title>
</svelte:head>

<div class="groups-page">
	<div class="groups-page__content" aria-busy={groupsStore.isLoading}>
		{#if groupsStore.isLoading}
			<List variant="outlined">
				{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
					<ListItem size="responsive" showChevron>
						{#snippet leading()}
							<Skeleton variant="circular" size="md" />
						{/snippet}
						<div class="group-item__skeleton">
							<Skeleton variant="text" size="md" width="60%" />
							<Skeleton variant="text" size="sm" width="80%" />
						</div>
					</ListItem>
				{/each}
			</List>
		{:else if groupsStore.isError}
			<EmptyState
				variant="error"
				title="Ошибка загрузки"
				description={groupsStore.error ?? 'Не удалось загрузить список групп'}
			>
				{#snippet action()}
					<Button variant="secondary" onclick={() => groupsStore.fetch()}>Повторить</Button>
				{/snippet}
			</EmptyState>
		{:else if groupsStore.isEmpty}
			<EmptyState
				Icon={Users}
				title="Нет групп"
				description="Создайте первую группу для совместного просмотра фильмов"
			>
				{#snippet action()}
					<Button variant="primary" onclick={handleCreateGroup}>Создать группу</Button>
				{/snippet}
			</EmptyState>
		{:else}
			<List variant="outlined" ariaLabel="Список групп">
				{#each groupsStore.groups as group (group.id)}
					<ListItem
						interactive
						size="responsive"
						onclick={() => handleGroupClick(group.id)}
						showChevron
					>
						{#snippet leading()}
							<Avatar src={group.avatarUrl} name={group.name} size="md" alt={group.name} />
						{/snippet}
						<div class="group-item__title">{group.name}</div>
						{#if group.description}
							<div class="group-item__subtitle">{group.description}</div>
						{/if}
					</ListItem>
				{/each}
			</List>

			{#if groupsStore.isFetching}
				<div class="groups-page__refreshing">
					<Spinner size="sm" />
				</div>
			{/if}
		{/if}
	</div>

	{#if !groupsStore.isEmpty}
		<FAB
			label="Создать группу"
			variant="ghost"
			offset="above-bottom-nav"
			onclick={handleCreateGroup}
		>
			{#snippet icon()}
				<Plus size={24} />
			{/snippet}
		</FAB>
	{/if}
</div>

<style>
	.groups-page {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		padding-block: var(--space-4);
	}

	.groups-page__content {
		flex: 1;
	}

	.groups-page__refreshing {
		display: flex;
		justify-content: center;
		padding: var(--space-4);
	}

	.group-item__title {
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		line-height: var(--leading-tight);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.group-item__subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-normal);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.group-item__skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
