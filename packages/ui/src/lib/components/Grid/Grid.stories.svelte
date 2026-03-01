<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { Button } from '../Button';
	import Grid from './Grid.svelte';
	import { Card } from '../Card';

	const { Story } = defineMeta({
		title: 'Components/Grid',
		component: Grid,
		tags: ['autodocs'],
		argTypes: {
			cols: {
				control: { type: 'number' },
				description: 'Fixed number of columns (undefined for auto-responsive)'
			},
			gap: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg', 'none'],
				description: 'Gap size between grid items'
			}
		}
	});
</script>

<Story name="Playground" args={{ gap: 'md', cols: undefined }}>
	{#snippet template()}
		<Grid gap="md">
			<Card size="md" variant="outlined">Item 1</Card>
			<Card size="md" variant="outlined">Item 2</Card>
			<Card size="md" variant="outlined">Item 3</Card>
			<Card size="md" variant="outlined">Item 4</Card>
		</Grid>
	{/snippet}
</Story>

<Story name="Responsive (Auto)">
	{#snippet template()}
		<Card size="lg" variant="filled">
			<p
				style="margin: 0 0 var(--space-4) 0; color: var(--text-secondary); font-size: var(--text-sm);"
			>
				Resize your browser to see the grid adapt: 2 cols → 3 cols → 4 cols
			</p>
			<Grid gap="md">
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Movie 1
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Movie 2
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Movie 3
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Movie 4
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Movie 5
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: var(--text-primary); font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Movie 6
					</div>
				</Card>
			</Grid>
		</Card>
	{/snippet}
</Story>

<Story name="Fixed Columns">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6);">
			<div>
				<h3 style="margin: 0 0 var(--space-3) 0;">2 Columns</h3>
				<Grid cols={2} gap="md">
					<Card size="md" variant="outlined">Item 1</Card>
					<Card size="md" variant="outlined">Item 2</Card>
					<Card size="md" variant="outlined">Item 3</Card>
					<Card size="md" variant="outlined">Item 4</Card>
				</Grid>
			</div>

			<div>
				<h3 style="margin: 0 0 var(--space-3) 0;">3 Columns</h3>
				<Grid cols={3} gap="md">
					<Card size="md" variant="outlined">Item 1</Card>
					<Card size="md" variant="outlined">Item 2</Card>
					<Card size="md" variant="outlined">Item 3</Card>
					<Card size="md" variant="outlined">Item 4</Card>
					<Card size="md" variant="outlined">Item 5</Card>
					<Card size="md" variant="outlined">Item 6</Card>
				</Grid>
			</div>

			<div>
				<h3 style="margin: 0 0 var(--space-3) 0;">4 Columns</h3>
				<Grid cols={4} gap="md">
					<Card size="sm" variant="outlined">Item 1</Card>
					<Card size="sm" variant="outlined">Item 2</Card>
					<Card size="sm" variant="outlined">Item 3</Card>
					<Card size="sm" variant="outlined">Item 4</Card>
					<Card size="sm" variant="outlined">Item 5</Card>
					<Card size="sm" variant="outlined">Item 6</Card>
					<Card size="sm" variant="outlined">Item 7</Card>
					<Card size="sm" variant="outlined">Item 8</Card>
				</Grid>
			</div>

			<div>
				<h3 style="margin: 0 0 var(--space-3) 0;">5 Columns</h3>
				<Grid cols={5} gap="md">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
					<Card size="sm" variant="outlined">5</Card>
					<Card size="sm" variant="outlined">6</Card>
					<Card size="sm" variant="outlined">7</Card>
					<Card size="sm" variant="outlined">8</Card>
					<Card size="sm" variant="outlined">9</Card>
					<Card size="sm" variant="outlined">10</Card>
				</Grid>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Custom Responsive">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6);">
			<div>
				<h3
					style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm); color: var(--text-secondary);"
				>
					{`cols={[1, 2, 4]} — 1 → 2 → 4`}
				</h3>
				<Grid cols={[1, 2, 4] as [number, number, number]} gap="md">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
					<Card size="sm" variant="outlined">5</Card>
					<Card size="sm" variant="outlined">6</Card>
				</Grid>
			</div>

			<div>
				<h3
					style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm); color: var(--text-secondary);"
				>
					{`cols={[2, 3, 4]} — 2 → 3 → 4`}
				</h3>
				<Grid cols={[2, 3, 4] as [number, number, number]} gap="md">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
					<Card size="sm" variant="outlined">5</Card>
					<Card size="sm" variant="outlined">6</Card>
				</Grid>
			</div>

			<div>
				<h3
					style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm); color: var(--text-secondary);"
				>
					{`cols={[1, 2, 3]} — 1 → 2 → 3`}
				</h3>
				<Grid cols={[1, 2, 3] as [number, number, number]} gap="md">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
					<Card size="sm" variant="outlined">5</Card>
					<Card size="sm" variant="outlined">6</Card>
				</Grid>
			</div>

			<div>
				<h3
					style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm); color: var(--text-secondary);"
				>
					{`cols={[1, 1, 2]} — 1 → 1 → 2`}
				</h3>
				<Grid cols={[1, 1, 2] as [number, number, number]} gap="md">
					<Card size="md" variant="outlined">Card 1</Card>
					<Card size="md" variant="outlined">Card 2</Card>
				</Grid>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Gap Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6);">
			<div>
				<h3 style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm);">gap="sm" (8px)</h3>
				<Grid cols={4} gap="sm">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
				</Grid>
			</div>

			<div>
				<h3 style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm);">gap="md" (12px)</h3>
				<Grid cols={4} gap="md">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
				</Grid>
			</div>

			<div>
				<h3 style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm);">gap="lg" (16px)</h3>
				<Grid cols={4} gap="lg">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
				</Grid>
			</div>

			<div>
				<h3 style="margin: 0 0 var(--space-2) 0; font-size: var(--text-sm);">gap="none" (0px)</h3>
				<Grid cols={4} gap="none">
					<Card size="sm" variant="outlined">1</Card>
					<Card size="sm" variant="outlined">2</Card>
					<Card size="sm" variant="outlined">3</Card>
					<Card size="sm" variant="outlined">4</Card>
				</Grid>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context - Movie Grid">
	{#snippet template()}
		<Card size="lg" variant="filled">
			<h2 style="margin: 0 0 var(--space-4) 0;">Popular Movies</h2>
			<Grid gap="md">
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Poster 1
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Poster 2
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Poster 3
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Poster 4
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Poster 5
					</div>
				</Card>
				<Card size="md" variant="outlined">
					<div
						style="aspect-ratio: 2/3; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-weight: var(--font-bold); margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1); width: calc(100% + var(--space-8)); border-radius: var(--radius-md) var(--radius-md) 0 0;"
					>
						Poster 6
					</div>
				</Card>
			</Grid>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Dashboard">
	{#snippet template()}
		<Card size="lg" variant="filled">
			<h2 style="margin: 0 0 var(--space-4) 0;">Dashboard Overview</h2>

			<h3 style="margin: var(--space-4) 0 var(--space-2) 0; font-size: var(--text-base);">
				Stats (4 columns)
			</h3>
			<Grid cols={4} gap="md">
				<Card size="sm" variant="outlined" style="text-align: center;">
					<div
						style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);"
					>
						156
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">Movies</div>
				</Card>
				<Card size="sm" variant="outlined" style="text-align: center;">
					<div
						style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-success);"
					>
						12
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">Groups</div>
				</Card>
				<Card size="sm" variant="outlined" style="text-align: center;">
					<div
						style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-warning);"
					>
						48
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">Watched</div>
				</Card>
				<Card size="sm" variant="outlined" style="text-align: center;">
					<div
						style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-error);"
					>
						8
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">Pending</div>
				</Card>
			</Grid>

			<h3 style="margin: var(--space-4) 0 var(--space-2) 0; font-size: var(--text-base);">
				Actions (3 columns)
			</h3>
			<Grid cols={3} gap="md">
				<Button variant="primary" style="width: 100%;">Add Movie</Button>
				<Button variant="secondary" style="width: 100%;">Create Group</Button>
				<Button variant="ghost" style="width: 100%;">View All</Button>
			</Grid>

			<h3 style="margin: var(--space-4) 0 var(--space-2) 0; font-size: var(--text-base);">
				Recent (2 columns)
			</h3>
			<Grid cols={2} gap="md">
				<Card size="md" variant="filled">
					<div style="font-weight: var(--font-semibold); margin-bottom: var(--space-2);">
						Recent Activity
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">
						<div style="padding: var(--space-2) 0;">• Added "Inception" to Watchlist</div>
						<div style="padding: var(--space-2) 0;">• Created new group "Movie Night"</div>
						<div style="padding: var(--space-2) 0;">• Rated "The Matrix" 5 stars</div>
					</div>
				</Card>
				<Card size="md" variant="filled">
					<div style="font-weight: var(--font-semibold); margin-bottom: var(--space-2);">
						Upcoming
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">
						<div style="padding: var(--space-2) 0;">• Group Watch: Friday 8PM</div>
						<div style="padding: var(--space-2) 0;">• Movie Marathon: Saturday</div>
						<div style="padding: var(--space-2) 0;">• New Releases: Check out list</div>
					</div>
				</Card>
			</Grid>
		</Card>
	{/snippet}
</Story>
