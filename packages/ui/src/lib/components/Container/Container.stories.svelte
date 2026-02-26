<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Container from './Container.svelte';
	import { Card } from '../Card';

	const { Story } = defineMeta({
		title: 'Components/Container',
		component: Container,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
			centered: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ size: 'xl', centered: true }}>
	<div style="background: var(--bg-tertiary); padding: 40px 0;">
		<Card size="md" variant="outlined">
			<h2 style="margin: 0 0 var(--space-3) 0;">Container Content</h2>
			<p style="margin: 0;">Size: <strong>xl</strong></p>
			<p style="margin: var(--space-2) 0 0 0;">Centered: <strong>Yes</strong></p>
		</Card>
	</div>
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div style="background: var(--bg-tertiary); padding: 40px 0;">
			<div style="display: flex; flex-direction: column; gap: var(--space-6);">
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						size="sm" → max-width: 640px
					</div>
					<Container size="sm">
						<Card size="md" variant="outlined">SM Container (640px)</Card>
					</Container>
				</div>
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						size="md" → max-width: 768px
					</div>
					<Container size="md">
						<Card size="md" variant="outlined">MD Container (768px)</Card>
					</Container>
				</div>
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						size="lg" → max-width: 1024px
					</div>
					<Container size="lg">
						<Card size="md" variant="outlined">LG Container (1024px)</Card>
					</Container>
				</div>
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						size="xl" → max-width: 1200px
					</div>
					<Container size="xl">
						<Card size="md" variant="outlined">XL Container (1200px)</Card>
					</Container>
				</div>
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						size="full" → max-width: 100%
					</div>
					<Container size="full">
						<Card size="md" variant="outlined">FULL Container (100% width)</Card>
					</Container>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Centered vs Not Centered">
	{#snippet template()}
		<div style="background: var(--bg-tertiary); padding: 40px 0;">
			<div style="display: flex; flex-direction: column; gap: var(--space-6);">
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						centered={true} (default)
					</div>
					<Container size="md" centered={true}>
						<Card size="md" variant="outlined">This container is centered horizontally</Card>
					</Container>
				</div>
				<div>
					<div
						style="margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm);"
					>
						centered={false}
					</div>
					<Container size="md" centered={false}>
						<Card size="md" variant="outlined"
							>This container is NOT centered (aligned to left)</Card
						>
					</Container>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context - Page Layout">
	{#snippet template()}
		<div style="background: var(--bg-tertiary); min-height: 400px;">
			<Container size="xl">
				<div style="margin-bottom: var(--space-6);">
					<Card size="md" variant="elevated">
						<h1 style="margin: 0; font-size: var(--text-2xl);">Page Header</h1>
						<p style="margin: var(--space-2) 0 0 0; color: var(--text-secondary);">
							A typical page layout with constrained content width
						</p>
					</Card>
				</div>

				<div style="display: flex; flex-direction: column; gap: var(--space-4);">
					<Card size="md" variant="outlined">
						<h2 style="margin: 0 0 var(--space-3) 0; font-size: var(--text-xl);">
							Main Content Section
						</h2>
						<p style="margin: 0; line-height: var(--leading-relaxed);">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
							incididunt ut labore et dolore magna aliqua.
						</p>
					</Card>

					<Card size="md" variant="outlined">
						<h2 style="margin: 0 0 var(--space-3) 0; font-size: var(--text-xl);">
							Another Section
						</h2>
						<p style="margin: 0; line-height: var(--leading-relaxed);">
							Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
							nulla pariatur.
						</p>
					</Card>
				</div>
			</Container>
		</div>
	{/snippet}
</Story>

<Story name="In Context - Content Sections">
	{#snippet template()}
		<div style="background: var(--bg-tertiary); padding: 40px 0;">
			<Container size="lg" style="margin-bottom: var(--space-6);">
				<Card size="lg" variant="elevated" style="text-align: center;">
					<h2 style="margin: 0; font-size: var(--text-2xl);">Hero Section</h2>
					<p style="margin: var(--space-2) 0 0 0;">Using size="lg" (1024px)</p>
				</Card>
			</Container>

			<Container size="md" style="margin-bottom: var(--space-6);">
				<Card size="md" variant="outlined">
					<h3 style="margin: 0 0 var(--space-2) 0;">Featured Content</h3>
					<p style="margin: 0;">Using size="md" (768px) - perfect for focused content sections</p>
				</Card>
			</Container>

			<Container size="xl">
				<Card size="md" variant="outlined">
					<h3 style="margin: 0 0 var(--space-2) 0;">Wide Content</h3>
					<p style="margin: 0;">Using size="xl" (1200px) - ideal for content-rich sections</p>
				</Card>
			</Container>
		</div>
	{/snippet}
</Story>
