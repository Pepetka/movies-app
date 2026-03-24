<script lang="ts">
	import { FAB, Tabs, Avatar, Spinner } from '@repo/ui';
	import { Plus, Pencil } from '@lucide/svelte';

	import {
		groupMoviesStore,
		MovieGrid,
		type MovieFilter,
		type MovieStatus
	} from '$lib/modules/movies';
	import { groupStore } from '$lib/modules/groups';
	import { PagePlaceholder } from '$lib/ui';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let activeFilter = $state<MovieFilter>('all');

	const filterTabs = [
		{ id: 'all', label: 'Все' },
		{ id: 'tracking', label: 'К просмотру' },
		{ id: 'planned', label: 'План' },
		{ id: 'watched', label: 'Смотрели' }
	];

	$effect(() => {
		const group = groupStore.currentGroup;
		topBarStore.configure({
			title: group?.name ?? `Группа ${groupId}`,
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUPS)),
			trailingAction: groupStore.isModerator
				? {
						Icon: Pencil,
						label: 'Редактировать',
						onclick: () => goto(resolve(ROUTES.GROUP_EDIT(groupId)))
					}
				: undefined
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		if (groupId) {
			void groupStore.fetchGroup(groupId);
			void groupMoviesStore.fetchMovies(groupId);
		}
	});

	const filteredMovies = $derived.by(() => {
		if (activeFilter === 'all') return groupMoviesStore.movies;
		return groupMoviesStore.getMoviesByStatus(activeFilter);
	});

	const handleFilterChange = (tabId: string) => {
		activeFilter = tabId as MovieFilter;
	};

	const handleAddMovie = () => {
		void goto(resolve(ROUTES.GROUP_MOVIES_SEARCH(groupId)));
	};

	const isLoading = $derived(groupStore.isLoading || groupMoviesStore.isLoading);

	const getTabCount = (tabId: string): number => {
		if (tabId === 'all') return groupMoviesStore.movies.length;
		return groupMoviesStore.getMoviesByStatus(tabId as MovieStatus).length;
	};
</script>

<svelte:head>
	<title>{groupStore.currentGroup?.name ?? 'Группа'} | Movies App</title>
</svelte:head>

{#if isLoading}
	<div class="loading-state">
		<Spinner size="lg" />
	</div>
{:else if groupStore.isError}
	<PagePlaceholder title="Ошибка" hint={groupStore.error ?? 'Не удалось загрузить группу'} />
{:else if groupStore.currentGroup}
	<div class="group-page">
		<div class="group-page__header">
			<div class="group-info">
				<Avatar
					src={groupStore.currentGroup.avatarUrl}
					name={groupStore.currentGroup.name}
					alt={groupStore.currentGroup.name}
					size="xl"
				/>
				<div class="group-info__content">
					<h1 class="group-info__title">{groupStore.currentGroup.name}</h1>
					{#if groupStore.currentGroup.description}
						<p class="group-info__description">{groupStore.currentGroup.description}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="group-page__content">
			<Tabs
				tabs={filterTabs.map((tab) => ({
					...tab,
					count: getTabCount(tab.id)
				}))}
				value={activeFilter}
				onChange={handleFilterChange}
			/>

			<div class="group-page__movies">
				<MovieGrid movies={filteredMovies} isLoading={groupMoviesStore.isFetching} />
			</div>
		</div>
	</div>

	<FAB label="Добавить фильм" onclick={handleAddMovie} offset="above-bottom-nav" variant="ghost">
		<Plus size={20} />
	</FAB>
{:else}
	<PagePlaceholder title="Группа не найдена" hint="Возможно, она была удалена" />
{/if}

<style>
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.group-page {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.group-page__header {
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--border-primary);
	}

	.group-info {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.group-info__content {
		flex: 1;
		min-width: 0;
	}

	.group-info__title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
		line-height: var(--leading-tight);
	}

	.group-info__description {
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-normal);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.group-page__content {
		flex: 1;
	}

	.group-page__movies {
		margin-top: var(--space-4);
	}
</style>
