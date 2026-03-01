<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design/Border Radius'
	});
</script>

<Story name="Border Radius">
	{#snippet template()}
		<div class="radius-page">
			<section>
				<h2>Border Radius Scale</h2>
				<div class="radius-grid">
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-sm)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-sm</span>
							<code class="radius-value">var(--radius-sm) — 4px</code>
						</div>
					</div>
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-md)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-md</span>
							<code class="radius-value">var(--radius-md) — 6px</code>
						</div>
					</div>
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-lg)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-lg</span>
							<code class="radius-value">var(--radius-lg) — 8px</code>
						</div>
					</div>
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-xl)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-xl</span>
							<code class="radius-value">var(--radius-xl) — 12px</code>
						</div>
					</div>
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-2xl)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-2xl</span>
							<code class="radius-value">var(--radius-2xl) — 16px</code>
						</div>
					</div>
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-3xl)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-3xl</span>
							<code class="radius-value">var(--radius-3xl) — 24px</code>
						</div>
					</div>
					<div class="radius-card">
						<div class="radius-demo" style="border-radius: var(--radius-full)"></div>
						<div class="radius-info">
							<span class="radius-name">radius-full</span>
							<code class="radius-value">var(--radius-full) — 9999px</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Usage Examples</h2>
				<div class="examples-grid">
					<div class="example-card">
						<div class="example-demo" style="border-radius: var(--radius-sm)">
							<span>Small</span>
						</div>
						<span class="example-label">radius-sm</span>
					</div>
					<div class="example-card">
						<div class="example-demo" style="border-radius: var(--radius-md)">
							<span>Medium</span>
						</div>
						<span class="example-label">radius-md</span>
					</div>
					<div class="example-card">
						<div class="example-demo" style="border-radius: var(--radius-lg)">
							<span>Large</span>
						</div>
						<span class="example-label">radius-lg</span>
					</div>
					<div class="example-card">
						<div class="example-demo" style="border-radius: var(--radius-xl)">
							<span>Extra Large</span>
						</div>
						<span class="example-label">radius-xl</span>
					</div>
					<div class="example-card">
						<div class="example-demo" style="border-radius: var(--radius-full)">
							<span>Pill</span>
						</div>
						<span class="example-label">radius-full</span>
					</div>
				</div>
			</section>
		</div>
	{/snippet}
</Story>

<style>
	.radius-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.radius-page section h2 {
		margin: 0 0 var(--space-4) 0;
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
	}

	.radius-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--space-4);
	}

	.radius-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
	}

	.radius-demo {
		width: 60px;
		height: 60px;
		background: var(--color-primary);
	}

	.radius-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		text-align: center;
	}

	.radius-name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.radius-value {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		font-family:
			'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro',
			monospace;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: var(--space-4);
	}

	.example-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
	}

	.example-demo {
		width: 80px;
		height: 80px;
		background: var(--color-primary);
		color: var(--text-inverse);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	.example-label {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		font-family:
			'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro',
			monospace;
	}
</style>
