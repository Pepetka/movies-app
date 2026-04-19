<script lang="ts">
	import { Button, FAB, Sheet, Tabs, Avatar, toast } from '@repo/ui';
	import { Plus, Pencil, Trash2, Users } from '@lucide/svelte';

	import {
		groupMoviesStore,
		MovieGrid,
		type MovieFilter,
		type MovieStatus,
		type UnifiedMovie
	} from '$lib/modules/movies';
	import {
		ROUTES,
		sortByDateField,
		withCurrentQuery,
		buildPath,
		goBack,
		type RouteValue
	} from '$lib/utils';
	import { groupStore } from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let showDeleteModal = $state(false);

	const openDeleteModal = () => {
		showDeleteModal = true;
	};

	const closeDeleteModal = () => {
		showDeleteModal = false;
		groupStore.resetDelete();
	};

	const handleDelete = async () => {
		await groupStore.deleteGroup(groupId);

		if (groupStore.isDeleteSuccess) {
			toast.success('Группа удалена');
			await goto(ROUTES.GROUPS);
		} else {
			toast.error(groupStore.deleteError ?? 'Ошибка удаления');
		}
	};

	const filterTabs = [
		{ id: 'all', label: 'Все' },
		{ id: 'tracking', label: 'К просмотру' },
		{ id: 'planned', label: 'План' },
		{ id: 'watched', label: 'Смотрели' }
	];

	const validFilters = filterTabs.map((t) => t.id);
	const activeFilter = $derived.by<MovieFilter>(() => {
		const tab = page.url.searchParams.get('tab');
		return tab && validFilters.includes(tab) ? (tab as MovieFilter) : 'all';
	});

	const handleMembersClick = () => {
		void goto(ROUTES.GROUP_MEMBERS(groupId));
	};

	const trailingActions = $derived([
		{
			Icon: Users,
			label: 'Участники',
			onclick: handleMembersClick
		},
		...(groupStore.isModerator
			? [
					{
						Icon: Pencil,
						label: 'Редактировать',
						onclick: () => goto(ROUTES.GROUP_EDIT(groupId), { replaceState: true })
					},
					...(groupStore.isAdmin
						? [
								{
									Icon: Trash2,
									label: 'Удалить группу',
									onclick: openDeleteModal
								}
							]
						: [])
				]
			: [])
	]);

	$effect(() => {
		topBarStore.configure({
			title: groupStore.currentGroup?.name ?? 'Группа',
			showBack: true,
			onBack: () => goBack(ROUTES.GROUPS),
			trailingActions
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		if (groupId) {
			void groupMoviesStore.fetchMovies(groupId);
		}
	});

	const filteredMovies = $derived.by(() => {
		const movies =
			activeFilter === 'all'
				? groupMoviesStore.movies
				: groupMoviesStore.getMoviesByStatus(activeFilter);

		if (activeFilter === 'planned' && movies.length > 1) {
			return sortByDateField(movies, 'watchDate', 'asc');
		}

		if (activeFilter === 'watched' && movies.length > 1) {
			return sortByDateField(movies, 'watchDate', 'desc');
		}

		return movies;
	});

	const handleFilterChange = (tabId: string) => {
		const path =
			tabId === 'all'
				? page.url.pathname
				: buildPath(page.url.pathname as RouteValue, { tab: tabId });
		void goto(path, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	};

	const handleAddMovie = () => {
		void goto(ROUTES.GROUP_MOVIES_SEARCH(groupId));
	};

	const handleMovieClick = (movie: UnifiedMovie) => {
		void goto(withCurrentQuery(ROUTES.GROUP_MOVIE_DETAIL(groupId, movie.id), ['tab']));
	};

	const getTabCount = (tabId: string): number => {
		if (tabId === 'all') return groupMoviesStore.movies.length;
		return groupMoviesStore.getMoviesByStatus(tabId as MovieStatus).length;
	};
</script>

<svelte:head>
	<title>{groupStore.currentGroup?.name ?? 'Группа'} · Movies App</title>
</svelte:head>

<div class="group-page">
	<div class="group-page__header">
		<div class="group-info">
			<Avatar
				src={groupStore.currentGroup?.avatarUrl}
				name={groupStore.currentGroup?.name}
				alt={groupStore.currentGroup?.name}
				size="xl"
			/>
			<div class="group-info__content">
				<h1 class="group-info__title">{groupStore.currentGroup?.name}</h1>
				{#if groupStore.currentGroup?.description}
					<p class="group-info__description">{groupStore.currentGroup?.description}</p>
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
			<MovieGrid
				movies={filteredMovies}
				isLoading={groupMoviesStore.isFetching}
				onMovieClick={handleMovieClick}
			/>
		</div>
	</div>
</div>

{#if groupStore.isModerator}
	<FAB label="Добавить фильм" onclick={handleAddMovie} offset="above-bottom-nav" variant="ghost">
		<Plus size={20} />
	</FAB>
{/if}

<Sheet bind:open={showDeleteModal} size="sm">
	{#snippet header()}
		<h2>Удалить группу?</h2>
	{/snippet}

	<p class="modal-text">
		Вы уверены, что хотите удалить группу "{groupStore.currentGroup?.name}"? Это действие нельзя
		отменить.
	</p>

	{#snippet footer()}
		<Button variant="secondary" onclick={closeDeleteModal} disabled={groupStore.isDeleting}>
			Отмена
		</Button>
		<Button variant="danger" onclick={handleDelete} loading={groupStore.isDeleting}>Удалить</Button>
	{/snippet}
</Sheet>

<style>
	.group-page {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		padding-block: var(--space-4);
		gap: var(--space-4);
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

	.modal-text {
		margin: 0;
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
	}
</style>
