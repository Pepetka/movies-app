<script lang="ts">
	import { Pencil, Trash2, Calendar, Clock } from '@lucide/svelte';
	import { Button, Image, Sheet, Spinner, toast } from '@repo/ui';

	import {
		groupMovieDetailStore,
		groupMovieStore,
		MovieRating,
		MovieStatusBadge,
		MovieStatusModal
	} from '$lib/modules/movies';
	import { ROUTES, formatDate, formatRuntime, withCurrentQuery, goBack } from '$lib/utils';
	import { PagePlaceholder } from '$lib/ui';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));
	const movieId = $derived(Number(page.params.movieId));
	const movie = $derived(groupMovieDetailStore.movie);
	const isLoading = $derived(groupMovieDetailStore.isLoading);

	let statusModalOpen = $state(false);
	let showDeleteModal = $state(false);

	const openDeleteModal = () => {
		showDeleteModal = true;
	};

	const closeDeleteModal = () => {
		showDeleteModal = false;
		groupMovieStore.resetRemove();
	};

	const handleDelete = async () => {
		await groupMovieStore.removeMovie(groupId, movieId);

		if (groupMovieStore.isRemoveSuccess) {
			toast.success('Фильм удалён из группы');
			await goto(withCurrentQuery(ROUTES.GROUP_DETAIL(groupId), ['tab']));
		} else {
			toast.error(groupMovieStore.removeError ?? 'Ошибка удаления');
		}
	};

	const trailingActions = $derived(
		groupMovieDetailStore.isModerator
			? [
					{
						Icon: Pencil,
						label: 'Редактировать',
						onclick: () => {
							void goto(withCurrentQuery(ROUTES.GROUP_MOVIE_EDIT(groupId, movieId), ['tab']));
						}
					},
					{
						Icon: Trash2,
						label: 'Удалить фильм',
						onclick: openDeleteModal
					}
				]
			: undefined
	);

	$effect(() => {
		topBarStore.configure({
			title: movie?.title ?? (isLoading ? '' : 'Фильм'),
			showBack: true,
			onBack: () => goBack(withCurrentQuery(ROUTES.GROUP_DETAIL(groupId), ['tab'])),
			trailingActions
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		if (groupId && movieId) {
			void groupMovieDetailStore.fetchMovie(groupId, movieId);
		}
	});

	const handleEditStatus = () => {
		statusModalOpen = true;
	};
</script>

<svelte:head>
	<title>{movie?.title ?? 'Фильм'} · Movies App</title>
</svelte:head>

{#if isLoading}
	<div class="loading-state">
		<Spinner size="lg" />
	</div>
{:else if groupMovieDetailStore.isError}
	<PagePlaceholder
		title="Ошибка"
		hint={groupMovieDetailStore.error ?? 'Не удалось загрузить фильм'}
	/>
{:else if movie}
	<div class="movie-page">
		<!-- Header with poster and info -->
		<div class="movie-header">
			<div class="movie-header__poster">
				<Image src={movie.posterPath} alt={movie.title} ratio="2/3" />
			</div>
			<div class="movie-header__info">
				<div class="movie-header__title-wrapper">
					<h1 class="movie-header__title">{movie.title}</h1>
					<div class="movie-header__meta">
						{#if movie.releaseYear}
							<span class="movie-header__meta-item">{movie.releaseYear}</span>
						{/if}
						{#if movie.runtime}
							<span class="movie-header__meta-item">
								<Clock size={14} />
								{formatRuntime(movie.runtime)}
							</span>
						{/if}
						{#if movie.rating}
							<MovieRating rating={movie.rating} />
						{/if}
					</div>
				</div>

				<!-- Status -->
				<div class="movie-header__status">
					<div class="movie-header__status-content">
						<div class="movie-header__status-badge">
							<MovieStatusBadge status={movie.status} />
						</div>

						{#if movie.watchDate}
							<div class="movie-header__date">
								<Calendar size={14} />
								<span>{formatDate(movie.watchDate)}</span>
							</div>
						{/if}
					</div>
					{#if groupMovieDetailStore.isModerator}
						<Button
							variant="ghost"
							size="sm"
							onclick={handleEditStatus}
							aria-label="Изменить статус"
						>
							<Pencil size={14} />
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Overview Section -->
		{#if movie.overview}
			<section class="movie-section">
				<div class="movie-section__header">
					<h2 class="movie-section__title">Описание</h2>
				</div>
				<div class="movie-section__content">
					<p class="movie-overview">{movie.overview}</p>
				</div>
			</section>
		{/if}
	</div>
{:else}
	<PagePlaceholder title="Фильм не найден" hint="Возможно, он был удалён" />
{/if}

<MovieStatusModal bind:open={statusModalOpen} {movie} {groupId} {movieId} />

<Sheet bind:open={showDeleteModal} size="sm">
	{#snippet header()}
		<h2>Удалить фильм?</h2>
	{/snippet}

	<p class="modal-text">
		Вы уверены, что хотите удалить фильм "{movie?.title}" из группы? Это действие нельзя отменить.
	</p>

	{#snippet footer()}
		<Button variant="secondary" onclick={closeDeleteModal} disabled={groupMovieStore.isRemoving}>
			Отмена
		</Button>
		<Button variant="danger" onclick={handleDelete} loading={groupMovieStore.isRemoving}>
			Удалить
		</Button>
	{/snippet}
</Sheet>

<style>
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.movie-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-block: var(--space-6);
	}

	.movie-header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
	}

	.movie-header__poster {
		flex-shrink: 0;
		width: 120px;
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.movie-header__info {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.movie-header__title-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.movie-header__title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
		line-height: var(--leading-tight);
	}

	.movie-header__meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.movie-header__meta-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.movie-header__status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}

	.movie-header__status-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.movie-header__status-badge {
		width: fit-content;
	}

	.movie-header__date {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.movie-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.movie-section__header {
		border-bottom: 1px solid var(--border-primary);
		padding-bottom: var(--space-2);
	}

	.movie-section__title {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		color: var(--text-secondary);
	}

	.movie-section__content {
		padding-top: var(--space-1);
	}

	.movie-overview {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-primary);
		line-height: var(--leading-relaxed);
	}

	@media (min-width: 480px) {
		.movie-header__poster {
			width: 160px;
		}

		.movie-header__title {
			font-size: var(--text-2xl);
		}
	}

	@media (min-width: 768px) {
		.movie-header__poster {
			width: 200px;
		}
	}

	.modal-text {
		margin: 0;
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
	}
</style>
