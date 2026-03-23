<script lang="ts">
	import { Input, Spinner, EmptyState, List, ListItem, Image, Badge, toast } from '@repo/ui';
	import { Star, Search } from '@lucide/svelte';

	import { moviesSearchStore, groupMovieStore } from '$lib/modules/movies';
	import type { ProviderMovieSummary } from '$lib/api/generated/types';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));
	let inputValue = $state('');

	$effect(() => {
		topBarStore.configure({
			title: 'Добавить фильм',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUP_DETAIL(groupId)))
		});
		return () => {
			topBarStore.destroy();
			moviesSearchStore.cancel();
			moviesSearchStore.clear();
		};
	});

	const handleClear = () => {
		inputValue = '';
		moviesSearchStore.clear();
	};

	const formatSubtitle = (movie: ProviderMovieSummary): string => {
		const parts: string[] = [];
		if (movie.releaseYear) parts.push(String(movie.releaseYear));
		return parts.join(' • ') || 'Нет данных';
	};

	const handleMovieClick = async (movie: ProviderMovieSummary) => {
		const imdbId = typeof movie.imdbId === 'string' ? movie.imdbId : undefined;
		await groupMovieStore.addMovie(groupId, {
			imdbId,
			externalId: imdbId ? undefined : movie.externalId
		});

		if (groupMovieStore.isAddSuccess) {
			toast.success('Фильм добавлен');
			await goto(resolve(ROUTES.GROUP_DETAIL(groupId)));
		} else {
			toast.error(groupMovieStore.addError ?? 'Ошибка добавления');
		}
	};
</script>

<svelte:head>
	<title>Добавить фильм | Movies App</title>
</svelte:head>

<div class="search-page">
	<div class="search-page__input">
		<Input
			bind:value={inputValue}
			label="Поиск фильма"
			placeholder="Введите название..."
			Icon={Search}
			iconAction={inputValue ? handleClear : undefined}
			iconLabel={inputValue ? 'Очистить' : undefined}
			onChange={(value) => moviesSearchStore.search(groupId, value)}
		/>
	</div>

	<div class="search-page__results">
		{#if moviesSearchStore.isLoading}
			<div class="search-page__loading">
				<Spinner size="lg" />
			</div>
		{:else if moviesSearchStore.isError}
			<EmptyState
				title="Ошибка"
				description={moviesSearchStore.error ?? undefined}
				variant="error"
			/>
		{:else if inputValue && moviesSearchStore.isEmpty}
			<EmptyState title="Ничего не найдено" description="Попробуйте изменить запрос" />
		{:else if !moviesSearchStore.isEmpty}
			<List variant="outlined" ariaLabel="Результаты поиска">
				{#each moviesSearchStore.results as movie (movie.externalId)}
					<ListItem
						interactive={true}
						title={movie.title}
						subtitle={formatSubtitle(movie)}
						size="lg"
						onclick={() => handleMovieClick(movie)}
					>
						{#snippet leading()}
							<Image
								src={typeof movie.posterPath === 'string' ? movie.posterPath : undefined}
								alt={movie.title}
								ratio="2/3"
								width={48}
								objectFit="cover"
							/>
						{/snippet}
						{#snippet trailing()}
							{#if movie.rating}
								<Badge variant="primary">
									<div class="search-page__badge-content">
										<Star size={12} fill="currentColor" />
										{movie.rating.toFixed(1)}
									</div>
								</Badge>
							{/if}
						{/snippet}
					</ListItem>
				{/each}
			</List>
		{:else}
			<EmptyState title="Поиск фильмов" description="Введите название для поиска" />
		{/if}
	</div>
</div>

<style>
	.search-page {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.search-page__input {
		padding: var(--space-4) 0;
	}

	.search-page__input :global(.ui-input-message) {
		display: none;
	}

	.search-page__results {
		flex: 1;
		padding: var(--space-4) 0;
	}

	.search-page__badge-content {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.search-page__loading {
		display: flex;
		justify-content: center;
		padding: var(--space-8) 0;
	}
</style>
