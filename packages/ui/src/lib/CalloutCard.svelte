<script lang="ts">
	export let title = 'Featured pick';
	export let description = 'A quick highlight to draw attention to something new.';
</script>

<section class="callout">
	<h2>{title}</h2>
	<p>{description}</p>
</section>

<style>
	.callout {
		border: 2px solid currentColor;
		border-radius: 16px;
		padding: 20px 24px;
		max-width: 520px;
	}

	h2 {
		font-size: 1.6rem;
		letter-spacing: 0.02em;
		margin: 0 0 8px;
	}

	p {
		margin: 0;
		opacity: 0.75;
	}
</style>
