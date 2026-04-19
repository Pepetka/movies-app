<script lang="ts">
	import { Spinner, toast } from '@repo/ui';
	import { untrack } from 'svelte';

	import {
		groupMovieDetailStore,
		groupMovieStore,
		MovieForm,
		EMPTY_CUSTOM_MOVIE_FORM,
		customMovieFormFromEntity,
		customMovieFormToUpdateDto,
		type CustomMovieFormData
	} from '$lib/modules/movies';
	import { ROUTES, withCurrentQuery, goBack } from '$lib/utils';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import '$lib/styles/page-states.css';

	const groupId = $derived(Number(page.params.id));
	const movieId = $derived(Number(page.params.movieId));

	let form = $state<CustomMovieFormData>({ ...EMPTY_CUSTOM_MOVIE_FORM });
	let hasRedirected = $state(false);

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goBack(withCurrentQuery(ROUTES.GROUP_MOVIE_DETAIL(groupId, movieId), ['tab']))
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		if (groupId && movieId) {
			void groupMovieDetailStore.fetchMovie(groupId, movieId);
		}

		return () => {
			groupMovieStore.resetUpdate();
		};
	});

	$effect(() => {
		const rawMovie = groupMovieDetailStore.rawMovie;
		if (groupMovieDetailStore.isLoaded && rawMovie && rawMovie.id === movieId) {
			if (!groupMovieDetailStore.isModerator && !hasRedirected) {
				hasRedirected = true;
				toast.error('Редактирование доступно только модераторам');
				void goto(ROUTES.GROUP_MOVIE_DETAIL(groupId, movieId), { replaceState: true });
				return;
			}
			untrack(() => {
				form = customMovieFormFromEntity(rawMovie);
			});
		}
	});

	const handleSubmit = async () => {
		await groupMovieStore.updateMovie(groupId, movieId, customMovieFormToUpdateDto(form));

		if (groupMovieStore.isUpdateSuccess) {
			toast.success('Фильм обновлён');
			await goto(ROUTES.GROUP_MOVIE_DETAIL(groupId, movieId), { replaceState: true });
		} else {
			toast.error(groupMovieStore.updateError ?? 'Ошибка обновления');
		}
	};

	const handleRetry = () => {
		void groupMovieDetailStore.fetchMovie(groupId, movieId);
	};
</script>

<svelte:head>
	<title>Редактирование фильма · Movies App</title>
</svelte:head>

{#if groupMovieDetailStore.isLoading}
	<div class="page-state">
		<Spinner size="lg" />
	</div>
{:else if groupMovieDetailStore.isError}
	<div class="page-state">
		<p class="page-state__error-message">{groupMovieDetailStore.error}</p>
		<button class="page-state__retry-button" onclick={handleRetry}>Повторить</button>
	</div>
{:else if groupMovieDetailStore.movie && groupMovieDetailStore.isModerator}
	<div class="edit-page">
		<MovieForm
			mode="edit"
			bind:form
			onSubmit={handleSubmit}
			isSubmitting={groupMovieStore.isUpdating}
		/>
	</div>
{:else}
	<div class="page-state">
		<Spinner size="lg" />
	</div>
{/if}

<style>
	.edit-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding-block: var(--space-4);
		align-items: center;
	}

	@media (min-width: 480px) {
		.edit-page {
			padding: var(--space-6) var(--space-6) var(--space-10);
		}
	}
</style>
