<script lang="ts">
	import { Calendar } from '@lucide/svelte';
	import { Card, Image } from '@repo/ui';

	import { formatDate } from '$lib/utils';

	import MovieStatusBadge from './MovieStatusBadge.svelte';
	import type { IProps } from './MovieCard.types';
	import MovieRating from './MovieRating.svelte';

	let { movie, onclick, ...restProps }: IProps = $props();

	const yearDisplay = $derived(movie.releaseYear ? String(movie.releaseYear) : undefined);

	const dateDisplay = $derived.by(() => {
		return movie.watchDate ? formatDate(movie.watchDate, 'short') : null;
	});
</script>

<Card variant="outlined" interactive={!!onclick} {onclick} {...restProps}>
	<div class="movie-card">
		<div class="movie-card__poster">
			<Image src={movie.posterPath} alt={movie.title} ratio="2/3" />
			<div class="movie-card__badge">
				<MovieStatusBadge status={movie.status} />
			</div>
		</div>

		<div class="movie-card__info">
			<h3 class="movie-card__title">{movie.title}</h3>
			<div class="movie-card__meta">
				{#if yearDisplay}
					<span class="movie-card__year">{yearDisplay}</span>
				{/if}
				{#if movie.rating}
					<MovieRating rating={movie.rating} size={12} />
				{/if}
			</div>
			{#if dateDisplay}
				<div class="movie-card__date">
					<Calendar size={12} />
					<span>{dateDisplay}</span>
				</div>
			{/if}
		</div>
	</div>
</Card>

<style>
	.movie-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: var(--space-2);
	}

	.movie-card__poster {
		position: relative;
		aspect-ratio: 2 / 3;
		overflow: hidden;
		border-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	.movie-card__badge {
		position: absolute;
		bottom: var(--space-2);
		left: var(--space-2);
	}

	.movie-card__info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
	}

	.movie-card__title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		line-height: var(--leading-tight);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.movie-card__meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.movie-card__date {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
