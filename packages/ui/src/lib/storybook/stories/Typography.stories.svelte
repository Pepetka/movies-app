<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design/Typography'
	});
</script>

<Story name="Typography">
	{#snippet template()}
		<div class="typography-page">
			<section>
				<h2>Font Sizes</h2>
				<div class="type-scale">
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-xs)">Extra Small Text</span>
						<div class="type-info">
							<span class="type-name">text-xs</span>
							<code class="type-value">var(--text-xs) — 0.75rem (12px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-sm)">Small Text</span>
						<div class="type-info">
							<span class="type-name">text-sm</span>
							<code class="type-value">var(--text-sm) — 0.875rem (14px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-base)">Base Text</span>
						<div class="type-info">
							<span class="type-name">text-base</span>
							<code class="type-value">var(--text-base) — 1rem (16px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-lg)">Large Text</span>
						<div class="type-info">
							<span class="type-name">text-lg</span>
							<code class="type-value">var(--text-lg) — 1.125rem (18px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-xl)">Extra Large Text</span>
						<div class="type-info">
							<span class="type-name">text-xl</span>
							<code class="type-value">var(--text-xl) — 1.25rem (20px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-2xl)">2XL Text</span>
						<div class="type-info">
							<span class="type-name">text-2xl</span>
							<code class="type-value">var(--text-2xl) — 1.5rem (24px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-3xl)">3XL Text</span>
						<div class="type-info">
							<span class="type-name">text-3xl</span>
							<code class="type-value">var(--text-3xl) — 1.875rem (30px)</code>
						</div>
					</div>
					<div class="type-item">
						<span class="type-sample" style="font-size: var(--text-4xl)">4XL Text</span>
						<div class="type-info">
							<span class="type-name">text-4xl</span>
							<code class="type-value">var(--text-4xl) — 2.25rem (36px)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Font Weights</h2>
				<div class="weight-scale">
					<div class="weight-item">
						<span class="weight-sample" style="font-weight: var(--font-normal)">Normal Weight</span>
						<code class="weight-value">var(--font-normal) — 400</code>
					</div>
					<div class="weight-item">
						<span class="weight-sample" style="font-weight: var(--font-medium)">Medium Weight</span>
						<code class="weight-value">var(--font-medium) — 500</code>
					</div>
					<div class="weight-item">
						<span class="weight-sample" style="font-weight: var(--font-semibold)"
							>Semibold Weight</span
						>
						<code class="weight-value">var(--font-semibold) — 600</code>
					</div>
					<div class="weight-item">
						<span class="weight-sample" style="font-weight: var(--font-bold)">Bold Weight</span>
						<code class="weight-value">var(--font-bold) — 700</code>
					</div>
				</div>
			</section>

			<section>
				<h2>Line Heights</h2>
				<div class="leading-scale">
					<div class="leading-item">
						<span class="leading-sample" style="line-height: var(--leading-tight)"
							>Tight line height for headings and compact text. Lorem ipsum dolor sit amet.</span
						>
						<code class="leading-value">var(--leading-tight) — 1.25</code>
					</div>
					<div class="leading-item">
						<span class="leading-sample" style="line-height: var(--leading-normal)"
							>Normal line height for body text. Lorem ipsum dolor sit amet, consectetur adipiscing
							elit.</span
						>
						<code class="leading-value">var(--leading-normal) — 1.5</code>
					</div>
					<div class="leading-item">
						<span class="leading-sample" style="line-height: var(--leading-relaxed)"
							>Relaxed line height for larger text. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit. Sed do eiusmod tempor.</span
						>
						<code class="leading-value">var(--leading-relaxed) — 1.625</code>
					</div>
				</div>
			</section>
		</div>
	{/snippet}
</Story>

<style>
	.typography-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.typography-page section h2 {
		margin: 0 0 var(--space-4) 0;
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
	}

	.type-scale,
	.weight-scale,
	.leading-scale {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.type-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.type-sample {
		color: var(--text-primary);
	}

	.type-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.type-name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.type-value,
	.weight-value,
	.leading-value {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		font-family:
			'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro',
			monospace;
	}

	.weight-item,
	.leading-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.weight-sample,
	.leading-sample {
		color: var(--text-primary);
		font-size: var(--text-base);
	}
</style>
