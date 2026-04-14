<script lang="ts">
	import {
		Input,
		Spinner,
		EmptyState,
		List,
		ListItem,
		Image,
		toast,
		Button,
		Select
	} from '@repo/ui';
	import { Search } from '@lucide/svelte';

	import { MOVIE_SEARCH_YEAR_FILTER } from '$lib/modules/movies/config/movies-search.config';
	import { moviesSearchStore, groupMovieStore, MovieRating } from '$lib/modules/movies';
	import type { ProviderMovieSummary } from '$lib/api/generated/types';
	import { groupStore } from '$lib/modules/groups';
	import { goBack, ROUTES } from '$lib/utils';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));
	let inputValue = $state('');
	let selectedYear = $state('');
	let hasRedirected = $state(false);

	const currentYear = new Date().getFullYear();
	const maxYear = currentYear + MOVIE_SEARCH_YEAR_FILTER.futureOffset;
	const yearOptions = Array.from(
		{ length: maxYear - (MOVIE_SEARCH_YEAR_FILTER.minYear - 1) },
		(_, i) => {
			const year = String(maxYear - i);
			return { value: year, label: year };
		}
	);

	const yearFilter = $derived<{ yearFrom?: number; yearTo?: number }>(
		selectedYear ? { yearFrom: Number(selectedYear), yearTo: Number(selectedYear) } : {}
	);

	$effect(() => {
		topBarStore.configure({
			title: 'Добавить фильм',
			showBack: true,
			onBack: () => goBack(ROUTES.GROUP_DETAIL(groupId))
		});
		return () => {
			topBarStore.destroy();
			moviesSearchStore.cancel();
			moviesSearchStore.clear();
		};
	});

	$effect(() => {
		if (groupStore.isLoaded && !groupStore.isModerator && !hasRedirected) {
			hasRedirected = true;
			toast.error('Добавление фильмов доступно только модераторам');
			void goto(ROUTES.GROUP_DETAIL(groupId));
		}
	});

	const handleClear = () => {
		inputValue = '';
		selectedYear = '';
		moviesSearchStore.clear();
	};

	const handleInputChange = (value: string) => {
		inputValue = value;
		moviesSearchStore.search(groupId, value, yearFilter.yearFrom, yearFilter.yearTo);
	};

	const handleYearChange = (value: string) => {
		selectedYear = value;
		if (inputValue.trim()) {
			moviesSearchStore.search(groupId, inputValue, yearFilter.yearFrom, yearFilter.yearTo);
		}
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
			handleClear();
		} else {
			toast.error(groupMovieStore.addError ?? 'Ошибка добавления');
		}
	};
</script>

<svelte:head>
	<title>Добавить фильм · Movies App</title>
</svelte:head>

<div class="search-page">
	<div class="search-page__input">
		<Input
			bind:value={inputValue}
			label="Поиск фильма"
			placeholder="Введите название..."
			hideMessage
			Icon={Search}
			iconAction={inputValue ? handleClear : undefined}
			iconLabel={inputValue ? 'Очистить' : undefined}
			onChange={handleInputChange}
		/>
		<div class="search-page__year-select">
			<Select
				label="Год"
				placeholder="Все"
				options={yearOptions}
				value={selectedYear}
				onChange={handleYearChange}
			/>
		</div>
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
								<MovieRating rating={movie.rating} size={12} />
							{/if}
						{/snippet}
					</ListItem>
				{/each}
			</List>
		{:else}
			<EmptyState title="Поиск фильмов" description="Введите название для поиска" />
		{/if}
	</div>

	<div class="search-page__footer">
		<p class="search-page__footer-text">Не нашли фильм?</p>
		<Button variant="ghost" size="sm" onclick={() => goto(ROUTES.GROUP_MOVIE_NEW(groupId))}>
			Создайте свой
		</Button>
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
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@media (min-width: 768px) {
		.search-page__input {
			flex-direction: row;
			align-items: flex-start;
		}
	}

	.search-page__year-select {
		width: 140px;
	}

	.search-page__results {
		flex: 1;
		padding: var(--space-4) 0;
	}

	.search-page__loading {
		display: flex;
		justify-content: center;
		padding: var(--space-8) 0;
	}

	.search-page__footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-4) 0 var(--space-6);
	}

	.search-page__footer-text {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin: 0;
	}
</style>
