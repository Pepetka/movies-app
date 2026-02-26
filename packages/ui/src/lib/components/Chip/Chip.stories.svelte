<script module lang="ts">
	import { Star, Heart, Film, Calendar, TrendingUp } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { Badge } from '../Badge';
	import Chip from './Chip.svelte';
	import { Card } from '../Card';

	const { Story } = defineMeta({
		title: 'Components/Chip',
		component: Chip,
		tags: ['autodocs'],
		argTypes: {
			selected: { control: 'boolean' },
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			disabled: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ selected: false, size: 'md' }}>Comedy</Story>

<Story name="All Sizes">
	{#snippet template()}
		<Card size="md" variant="filled">
			<div style="display: flex; flex-direction: column; gap: var(--space-4);">
				<div>
					<Badge size="sm">sm</Badge>
					<div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
						<Chip size="sm">Default</Chip>
						<Chip size="sm" selected>Selected</Chip>
					</div>
				</div>
				<div>
					<Badge size="sm">md</Badge>
					<div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
						<Chip size="md">Default</Chip>
						<Chip size="md" selected>Selected</Chip>
					</div>
				</div>
				<div>
					<Badge size="sm">lg</Badge>
					<div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
						<Chip size="lg">Default</Chip>
						<Chip size="lg" selected>Selected</Chip>
					</div>
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="All States">
	{#snippet template()}
		<Card size="md" variant="filled">
			<div style="display: flex; flex-direction: column; gap: var(--space-3);">
				<div style="display: flex; align-items: center; gap: var(--space-3);">
					<Badge size="sm">Default</Badge>
					<Chip>Default</Chip>
				</div>
				<div style="display: flex; align-items: center; gap: var(--space-3);">
					<Badge size="sm">Selected</Badge>
					<Chip selected>Selected</Chip>
				</div>
				<div style="display: flex; align-items: center; gap: var(--space-3);">
					<Badge size="sm">Disabled</Badge>
					<Chip disabled>Disabled</Chip>
				</div>
				<div style="display: flex; align-items: center; gap: var(--space-3);">
					<Badge size="sm">Disabled + Selected</Badge>
					<Chip selected disabled>Disabled</Chip>
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="With Custom Icon">
	{#snippet template()}
		<Card size="md" variant="filled">
			<div style="display: flex; flex-direction: column; gap: var(--space-4);">
				<div>
					<Badge size="sm">With Star</Badge>
					<div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
						<Chip size="sm" Icon={Star}>Favorites</Chip>
						<Chip size="sm" selected Icon={Star}>Favorites</Chip>
					</div>
				</div>
				<div>
					<Badge size="sm">With Heart</Badge>
					<div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
						<Chip size="md" Icon={Heart}>Liked</Chip>
						<Chip size="md" selected Icon={Heart}>Liked</Chip>
					</div>
				</div>
				<div>
					<Badge size="sm">Selected without custom icon</Badge>
					<div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
						<Chip size="sm" selected>Action</Chip>
						<Chip size="md" selected>Action</Chip>
					</div>
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Genre Filters">
	{#snippet template()}
		<Card size="md" variant="filled">
			<div style="display: flex; flex-direction: column; gap: var(--space-6);">
				<div>
					<h3 style="margin: 0 0 var(--space-3) 0;">Filter by Genre</h3>
					<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
						<Chip size="sm" selected>All</Chip>
						<Chip size="sm">Action</Chip>
						<Chip size="sm">Comedy</Chip>
						<Chip size="sm" selected>Drama</Chip>
						<Chip size="sm">Horror</Chip>
						<Chip size="sm">Sci-Fi</Chip>
						<Chip size="sm">Thriller</Chip>
					</div>
				</div>

				<div>
					<h3 style="margin: 0 0 var(--space-3) 0;">Large Filter Chips</h3>
					<div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
						<Chip size="md">2024</Chip>
						<Chip size="md" selected>2023</Chip>
						<Chip size="md">2022</Chip>
						<Chip size="md">2021</Chip>
						<Chip size="md">2020</Chip>
					</div>
				</div>

				<div>
					<h3 style="margin: 0 0 var(--space-3) 0;">Rating Filter</h3>
					<Card size="sm" variant="outlined">
						<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
							<Chip size="sm" Icon={TrendingUp}>All</Chip>
							<Chip size="sm" Icon={TrendingUp}>7+</Chip>
							<Chip size="sm" Icon={TrendingUp}>8+</Chip>
							<Chip size="sm" selected Icon={TrendingUp}>9+</Chip>
						</div>
					</Card>
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Tags">
	{#snippet template()}
		<Card size="md" variant="filled">
			<div style="display: flex; flex-direction: column; gap: var(--space-6);">
				<div>
					<h3 style="margin: 0 0 var(--space-3) 0;">Movie Tags</h3>
					<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
						<Chip size="sm" Icon={Film}>Must Watch</Chip>
						<Chip size="sm" selected Icon={Film}>Watched</Chip>
						<Chip size="sm" Icon={Calendar}>Planned</Chip>
						<Chip size="sm" Icon={Heart}>Favorite</Chip>
					</div>
				</div>

				<div>
					<h3 style="margin: 0 0 var(--space-3) 0;">User Interests</h3>
					<Card size="sm" variant="outlined">
						<div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
							<Chip size="md">Marvel</Chip>
							<Chip size="md" selected>DC</Chip>
							<Chip size="md">Star Wars</Chip>
							<Chip size="md">Harry Potter</Chip>
							<Chip size="md" selected>Anime</Chip>
						</div>
					</Card>
				</div>

				<div>
					<h3 style="margin: 0 0 var(--space-3) 0;">Quick Actions</h3>
					<Card size="sm" variant="outlined">
						<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
							<Chip size="sm" Icon={Heart}>Add to Favorites</Chip>
							<Chip size="sm" Icon={Calendar}>Watch Later</Chip>
							<Chip size="sm" Icon={Film}>Watch Again</Chip>
						</div>
					</Card>
				</div>
			</div>
		</Card>
	{/snippet}
</Story>
