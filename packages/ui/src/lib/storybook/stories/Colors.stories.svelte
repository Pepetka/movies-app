<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design/Colors'
	});
</script>

<Story name="Colors">
	{#snippet template()}
		<div class="colors-page">
			<section>
				<h2>Primary Colors</h2>
				<div class="color-group">
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-primary)"></div>
						<div class="color-info">
							<span class="color-name">Primary</span>
							<code class="color-value">var(--color-primary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-primary-hover)"></div>
						<div class="color-info">
							<span class="color-name">Primary Hover</span>
							<code class="color-value">var(--color-primary-hover)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-primary-active)"></div>
						<div class="color-info">
							<span class="color-name">Primary Active</span>
							<code class="color-value">var(--color-primary-active)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Semantic Colors</h2>
				<div class="color-group">
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-success)"></div>
						<div class="color-info">
							<span class="color-name">Success</span>
							<code class="color-value">var(--color-success)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-warning)"></div>
						<div class="color-info">
							<span class="color-name">Warning</span>
							<code class="color-value">var(--color-warning)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-error)"></div>
						<div class="color-info">
							<span class="color-name">Error</span>
							<code class="color-value">var(--color-error)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-info)"></div>
						<div class="color-info">
							<span class="color-name">Info</span>
							<code class="color-value">var(--color-info)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch" style="background: var(--color-secondary)"></div>
						<div class="color-info">
							<span class="color-name">Secondary</span>
							<code class="color-value">var(--color-secondary)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Background Colors</h2>
				<div class="color-group">
					<div class="color-card">
						<div class="color-swatch bg-swatch" style="background: var(--bg-primary)"></div>
						<div class="color-info">
							<span class="color-name">Background Primary</span>
							<code class="color-value">var(--bg-primary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch bg-swatch" style="background: var(--bg-secondary)"></div>
						<div class="color-info">
							<span class="color-name">Background Secondary</span>
							<code class="color-value">var(--bg-secondary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch bg-swatch" style="background: var(--bg-tertiary)"></div>
						<div class="color-info">
							<span class="color-name">Background Tertiary</span>
							<code class="color-value">var(--bg-tertiary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch bg-swatch" style="background: var(--bg-inverse)"></div>
						<div class="color-info">
							<span class="color-name">Background Inverse</span>
							<code class="color-value">var(--bg-inverse)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch bg-swatch" style="background: var(--bg-overlay)"></div>
						<div class="color-info">
							<span class="color-name">Background Overlay</span>
							<code class="color-value">var(--bg-overlay)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Text Colors</h2>
				<div class="color-group">
					<div class="color-card">
						<div class="color-swatch text-swatch" style="background: var(--text-primary)"></div>
						<div class="color-info">
							<span class="color-name">Text Primary</span>
							<code class="color-value">var(--text-primary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch text-swatch" style="background: var(--text-secondary)"></div>
						<div class="color-info">
							<span class="color-name">Text Secondary</span>
							<code class="color-value">var(--text-secondary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch text-swatch" style="background: var(--text-tertiary)"></div>
						<div class="color-info">
							<span class="color-name">Text Tertiary</span>
							<code class="color-value">var(--text-tertiary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch text-swatch" style="background: var(--text-inverse)"></div>
						<div class="color-info">
							<span class="color-name">Text Inverse</span>
							<code class="color-value">var(--text-inverse)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch text-swatch" style="background: var(--text-link)"></div>
						<div class="color-info">
							<span class="color-name">Text Link</span>
							<code class="color-value">var(--text-link)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Border Colors</h2>
				<div class="color-group">
					<div class="color-card">
						<div class="color-swatch border-swatch" style="background: var(--border-primary)"></div>
						<div class="color-info">
							<span class="color-name">Border Primary</span>
							<code class="color-value">var(--border-primary)</code>
						</div>
					</div>
					<div class="color-card">
						<div
							class="color-swatch border-swatch"
							style="background: var(--border-secondary)"
						></div>
						<div class="color-info">
							<span class="color-name">Border Secondary</span>
							<code class="color-value">var(--border-secondary)</code>
						</div>
					</div>
					<div class="color-card">
						<div class="color-swatch border-swatch" style="background: var(--border-focus)"></div>
						<div class="color-info">
							<span class="color-name">Border Focus</span>
							<code class="color-value">var(--border-focus)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Status Colors</h2>
				<div class="color-group">
					<div class="color-card status-card">
						<div
							class="status-swatch"
							style="background: var(--status-tracking-bg); color: var(--status-tracking-text)"
						>
							<span class="status-label">Tracking</span>
						</div>
						<div class="color-info">
							<span class="color-name">Status Tracking</span>
							<code class="color-value">var(--status-tracking-*)</code>
						</div>
					</div>
					<div class="color-card status-card">
						<div
							class="status-swatch"
							style="background: var(--status-planned-bg); color: var(--status-planned-text)"
						>
							<span class="status-label">Planned</span>
						</div>
						<div class="color-info">
							<span class="color-name">Status Planned</span>
							<code class="color-value">var(--status-planned-*)</code>
						</div>
					</div>
					<div class="color-card status-card">
						<div
							class="status-swatch"
							style="background: var(--status-watched-bg); color: var(--status-watched-text)"
						>
							<span class="status-label">Watched</span>
						</div>
						<div class="color-info">
							<span class="color-name">Status Watched</span>
							<code class="color-value">var(--status-watched-*)</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Shadows</h2>
				<div class="shadow-group">
					<div class="shadow-card">
						<div class="shadow-demo" style="box-shadow: var(--shadow-sm)"></div>
						<div class="color-info">
							<span class="color-name">Shadow SM</span>
							<code class="color-value">var(--shadow-sm)</code>
						</div>
					</div>
					<div class="shadow-card">
						<div class="shadow-demo" style="box-shadow: var(--shadow-md)"></div>
						<div class="color-info">
							<span class="color-name">Shadow MD</span>
							<code class="color-value">var(--shadow-md)</code>
						</div>
					</div>
					<div class="shadow-card">
						<div class="shadow-demo" style="box-shadow: var(--shadow-lg)"></div>
						<div class="color-info">
							<span class="color-name">Shadow LG</span>
							<code class="color-value">var(--shadow-lg)</code>
						</div>
					</div>
					<div class="shadow-card">
						<div class="shadow-demo" style="box-shadow: var(--shadow-xl)"></div>
						<div class="color-info">
							<span class="color-name">Shadow XL</span>
							<code class="color-value">var(--shadow-xl)</code>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/snippet}
</Story>

<style>
	.colors-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.colors-page section h2 {
		margin: 0 0 var(--space-4) 0;
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
	}

	.color-group {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.color-card {
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--bg-primary);
	}

	.color-swatch {
		height: 80px;
		width: 100%;
	}

	.bg-swatch {
		border-bottom: 1px solid var(--border-primary);
	}

	.text-swatch {
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
	}

	.border-swatch {
		height: 12px;
	}

	.color-info {
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.color-name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.color-value {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		font-family:
			'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro',
			monospace;
	}

	.status-card {
		grid-column: span 1;
	}

	.status-swatch {
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	.shadow-group {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-6);
	}

	.shadow-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.shadow-demo {
		width: 80px;
		height: 80px;
		background: var(--bg-primary);
		border-radius: var(--radius-lg);
	}
</style>
