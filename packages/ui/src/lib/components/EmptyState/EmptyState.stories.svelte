<script module lang="ts">
	import { Search, Film, Frown, WifiOff } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import EmptyState from './EmptyState.svelte';
	import { Button } from '../Button';
	import { Card } from '../Card';

	const { Story } = defineMeta({
		title: 'Components/EmptyState',
		component: EmptyState,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: 'select', options: ['default', 'compact', 'error'] },
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			title: { control: 'text' },
			description: { control: 'text' }
		}
	});
</script>

<Story
	name="Playground"
	args={{
		variant: 'default',
		size: 'md',
		title: 'No items',
		description: 'There are no items to display.'
	}}
>
	{#snippet template(args)}
		<EmptyState {...args} />
	{/snippet}
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 32px; align-items: flex-start;">
			<div>
				<h4 style="margin: 0 0 8px 0; color: var(--text-secondary);">Small</h4>
				<EmptyState size="sm" title="No items" description="Add your first item to get started." />
			</div>

			<div>
				<h4 style="margin: 0 0 8px 0; color: var(--text-secondary);">Medium (default)</h4>
				<EmptyState size="md" title="No items" description="Add your first item to get started." />
			</div>

			<div>
				<h4 style="margin: 0 0 8px 0; color: var(--text-secondary);">Large</h4>
				<EmptyState size="lg" title="No items" description="Add your first item to get started." />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 32px; align-items: flex-start;">
			<div>
				<h4 style="margin: 0 0 8px 0; color: var(--text-secondary);">Default</h4>
				<EmptyState
					variant="default"
					title="No movies yet"
					description="Start building your collection."
				/>
			</div>

			<div>
				<h4 style="margin: 0 0 8px 0; color: var(--text-secondary);">Compact</h4>
				<EmptyState variant="compact" title="Empty list" description="No items found." />
			</div>

			<div>
				<h4 style="margin: 0 0 8px 0; color: var(--text-secondary);">Error</h4>
				<EmptyState
					variant="error"
					title="Something went wrong"
					description="Please try again later."
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Action">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 32px; align-items: flex-start;">
			<EmptyState
				title="No movies in your list"
				description="Start adding movies to keep track of what you want to watch."
			>
				{#snippet action()}
					<Button variant="primary" size="md">Add Movie</Button>
				{/snippet}
			</EmptyState>

			<EmptyState
				variant="error"
				title="Failed to load data"
				description="We couldn't load your movies. Check your connection."
			>
				{#snippet action()}
					<Button variant="secondary" size="md">Retry</Button>
				{/snippet}
			</EmptyState>
		</div>
	{/snippet}
</Story>

<Story name="Custom Icon">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 32px; align-items: flex-start;">
			<EmptyState
				Icon={Search}
				title="No search results"
				description="Try adjusting your search terms."
			/>

			<EmptyState
				Icon={Film}
				title="No movies found"
				description="This group doesn't have any movies yet."
			/>

			<EmptyState
				Icon={WifiOff}
				variant="error"
				title="Connection lost"
				description="Please check your internet connection."
			/>

			<EmptyState Icon={Frown} title="Something went wrong" description="We're looking into it." />
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 32px; max-width: 600px;">
			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">Empty Movie List</h3>
			<Card variant="outlined" size="lg" fullWidth>
				<EmptyState
					Icon={Film}
					size="lg"
					title="No movies in your collection"
					description="Start adding movies to keep track of what you want to watch."
				>
					{#snippet action()}
						<Button variant="primary">Browse Movies</Button>
					{/snippet}
				</EmptyState>
			</Card>

			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">Empty Search Results</h3>
			<Card variant="elevated" size="md" fullWidth>
				<EmptyState
					Icon={Search}
					variant="compact"
					size="sm"
					title="No results for 'matrix 4'"
					description="Try different keywords or check spelling."
				/>
			</Card>

			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">Error State</h3>
			<Card variant="filled" size="lg" fullWidth>
				<EmptyState
					variant="error"
					title="Failed to load movies"
					description="We couldn't fetch your movies. Please try again."
				>
					{#snippet action()}
						<Button variant="secondary">Retry</Button>
					{/snippet}
				</EmptyState>
			</Card>
		</div>
	{/snippet}
</Story>
