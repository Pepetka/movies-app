<script lang="ts">
	import { Button, Card, Modal, Spinner, toast } from '@repo/ui';
	import { Trash2 } from '@lucide/svelte';
	import { untrack } from 'svelte';

	import {
		groupMovieDetailStore,
		groupMovieStore,
		EMPTY_CUSTOM_MOVIE_FORM,
		customMovieFormFromEntity,
		customMovieFormToUpdateDto,
		type CustomMovieFormData
	} from '$lib/modules/movies';
	import MovieForm from '$lib/modules/movies/components/MovieForm.svelte';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	import '$lib/styles/page-states.css';
	import '$lib/styles/danger-zone.css';

	const groupId = $derived(Number(page.params.id));
	const movieId = $derived(Number(page.params.movieId));

	let form = $state<CustomMovieFormData>({ ...EMPTY_CUSTOM_MOVIE_FORM });
	let showDeleteModal = $state(false);

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUP_MOVIE_DETAIL(groupId, movieId)))
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		if (groupId && movieId) {
			void groupMovieDetailStore.fetchMovie(groupId, movieId);
		}

		return () => {
			groupMovieStore.resetUpdate();
			groupMovieStore.resetRemove();
		};
	});

	$effect(() => {
		const rawMovie = groupMovieDetailStore.rawMovie;
		if (groupMovieDetailStore.isLoaded && rawMovie && rawMovie.id === movieId) {
			untrack(() => {
				form = customMovieFormFromEntity(rawMovie);
			});
		}
	});

	$effect(() => {
		const rawMovie = groupMovieDetailStore.rawMovie;
		if (
			groupMovieDetailStore.isLoaded &&
			rawMovie &&
			rawMovie.id === movieId &&
			!groupMovieDetailStore.isModerator
		) {
			toast.error('Редактирование доступно только модераторам');
			void goto(resolve(ROUTES.GROUP_MOVIE_DETAIL(groupId, movieId)));
		}
	});

	const handleSubmit = async () => {
		await groupMovieStore.updateMovie(groupId, movieId, customMovieFormToUpdateDto(form));

		if (groupMovieStore.isUpdateSuccess) {
			toast.success('Фильм обновлён');
			await goto(resolve(ROUTES.GROUP_MOVIE_DETAIL(groupId, movieId)));
		} else {
			toast.error(groupMovieStore.updateError ?? 'Ошибка обновления');
		}
	};

	const handleRetry = () => {
		void groupMovieDetailStore.fetchMovie(groupId, movieId);
	};

	const handleDelete = async () => {
		await groupMovieStore.removeMovie(groupId, movieId);

		if (groupMovieStore.isRemoveSuccess) {
			toast.success('Фильм удалён из группы');
			await goto(resolve(ROUTES.GROUP_DETAIL(groupId)));
		} else {
			toast.error(groupMovieStore.removeError ?? 'Ошибка удаления');
		}
	};

	const openDeleteModal = () => {
		showDeleteModal = true;
	};

	const closeDeleteModal = () => {
		showDeleteModal = false;
		groupMovieStore.resetRemove();
	};
</script>

<svelte:head>
	<title>Редактирование фильма | Movies App</title>
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

		<Card variant="outlined" class="danger-zone-card">
			{#snippet header()}
				<div class="danger-zone__header">
					<h2 class="danger-zone__title">Опасная зона</h2>
					<p class="danger-zone__subtitle">Необратимые действия</p>
				</div>
			{/snippet}

			<div class="danger-zone__content">
				<Button variant="danger" fullWidth onclick={openDeleteModal}>
					<Trash2 size={16} />
					Удалить фильм из группы
				</Button>
			</div>
		</Card>
	</div>

	<Modal bind:open={showDeleteModal} size="sm">
		{#snippet header()}
			<h2>Удалить фильм?</h2>
		{/snippet}

		<p class="modal-text">
			Вы уверены, что хотите удалить фильм "{groupMovieDetailStore.movie?.title}" из группы? Это
			действие нельзя отменить.
		</p>

		{#snippet footer()}
			<Button variant="secondary" onclick={closeDeleteModal} disabled={groupMovieStore.isRemoving}>
				Отмена
			</Button>
			<Button variant="danger" onclick={handleDelete} loading={groupMovieStore.isRemoving}>
				Удалить
			</Button>
		{/snippet}
	</Modal>
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
