<script lang="ts">
	import { Star } from '@lucide/svelte';

	import type { IProps } from './MovieRating.types';

	let { rating, size = 14, showValue = true }: IProps = $props();

	const RATING_GOLD = 8;
	const RATING_SILVER = 6;

	const color = $derived.by(() => {
		if (rating >= RATING_GOLD) return 'var(--rating-gold)';
		if (rating >= RATING_SILVER) return 'var(--rating-silver)';
		return 'var(--rating-red)';
	});

	const displayValue = $derived(rating.toFixed(1));
</script>

<span class="movie-rating" style="color: {color}" aria-label="Рейтинг: {displayValue}">
	<Star {size} fill="currentColor" />
	{#if showValue}
		{displayValue}
	{/if}
</span>

<style>
	.movie-rating {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}
</style>
