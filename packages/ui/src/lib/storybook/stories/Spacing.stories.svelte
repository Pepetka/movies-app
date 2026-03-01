<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design/Spacing'
	});
</script>

<Story name="Spacing">
	{#snippet template()}
		<div class="spacing-page">
			<section>
				<h2>Spacing Scale</h2>
				<p class="description">Consistent spacing scale using 4px base unit.</p>
				<div class="spacing-list">
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-0)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-0</span>
							<code class="spacing-value">0px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-1)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-1</span>
							<code class="spacing-value">4px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-2)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-2</span>
							<code class="spacing-value">8px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-3)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-3</span>
							<code class="spacing-value">12px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-4)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-4</span>
							<code class="spacing-value">16px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-5)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-5</span>
							<code class="spacing-value">20px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-6)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-6</span>
							<code class="spacing-value">24px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-8)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-8</span>
							<code class="spacing-value">32px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-10)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-10</span>
							<code class="spacing-value">40px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-12)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-12</span>
							<code class="spacing-value">48px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-16)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-16</span>
							<code class="spacing-value">64px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-20)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-20</span>
							<code class="spacing-value">80px</code>
						</div>
					</div>
					<div class="spacing-item">
						<div class="spacing-bar" style="width: var(--space-24)"></div>
						<div class="spacing-info">
							<span class="spacing-name">space-24</span>
							<code class="spacing-value">96px</code>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Usage Example</h2>
				<div class="usage-example">
					<div class="usage-card" style="padding: var(--space-4)">
						<p style="margin: 0 0 var(--space-2) 0; font-weight: var(--font-medium)">
							Card with spacing
						</p>
						<p style="margin: 0; color: var(--text-secondary)">
							This card uses var(--space-4) for padding and var(--space-2) for gap between elements.
						</p>
					</div>
				</div>
			</section>
		</div>
	{/snippet}
</Story>

<style>
	.spacing-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.spacing-page section h2 {
		margin: 0 0 var(--space-4) 0;
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
	}

	.description {
		margin: 0 0 var(--space-4) 0;
		color: var(--text-secondary);
	}

	.spacing-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.spacing-item {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.spacing-bar {
		height: 24px;
		background: var(--color-primary);
		border-radius: var(--radius-sm);
		min-width: 4px;
	}

	.spacing-info {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.spacing-name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.spacing-value {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		font-family:
			'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro',
			monospace;
	}

	.usage-example {
		background: var(--bg-secondary);
		padding: var(--space-4);
		border-radius: var(--radius-lg);
	}

	.usage-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
	}
</style>
