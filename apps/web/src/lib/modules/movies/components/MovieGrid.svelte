<script lang="ts">
	import { EmptyState, Grid, Skeleton } from '@repo/ui';
	import { Film } from '@lucide/svelte';

	import type { IProps } from './MovieGrid.types.svelte';
	import MovieCard from './MovieCard.svelte';

	let {
		movies,
		isLoading = false,
		onMovieClick,
		class: className,
		...restProps
	}: IProps = $props();

	const skeletonCount = 6;
</script>

<div class={['movie-grid', className]} {...restProps}>
	{#if isLoading}
		<Grid cols={[2, 3, 5]} gap="md">
			{#each Array.from({ length: skeletonCount }, (_, i) => i) as i (i)}
				<div class="movie-grid__skeleton">
					<div class="movie-grid__skeleton-poster">
						<Skeleton variant="rectangular" full />
					</div>
					<div class="movie-grid__skeleton-text">
						<Skeleton variant="text" size="sm" width="80%" />
						<Skeleton variant="text" size="sm" width="50%" />
					</div>
				</div>
			{/each}
		</Grid>
	{:else if movies.length === 0}
		<EmptyState Icon={Film} title="Нет фильмов" description="Добавьте первый фильм в группу" />
	{:else}
		<Grid cols={[2, 3, 5]} gap="md">
			{#each movies as movie (movie.id)}
				<MovieCard {movie} onclick={onMovieClick ? () => onMovieClick(movie) : undefined} />
			{/each}
		</Grid>
	{/if}
</div>

<style>
	.movie-grid {
		width: 100%;
	}

	.movie-grid__skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.movie-grid__skeleton-poster {
		aspect-ratio: 2 / 3;
	}

	.movie-grid__skeleton-text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: 0 var(--space-1);
	}
</style>
