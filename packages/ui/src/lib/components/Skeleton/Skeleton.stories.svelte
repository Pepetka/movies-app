<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { SkeletonVariant, SkeletonSize } from './Skeleton.types.svelte';
	import Avatar from '../Avatar/Avatar.svelte';
	import Skeleton from './Skeleton.svelte';
	import Card from '../Card/Card.svelte';

	const { Story } = defineMeta({
		title: 'Components/Skeleton',
		component: Skeleton,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['text', 'circular', 'rectangular'] as SkeletonVariant[]
			},
			size: { control: 'select', options: ['sm', 'md', 'lg'] as SkeletonSize[] }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'text', size: 'md', width: 200 }} />

<Story name="Text Variant">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
			<Skeleton variant="text" size="sm" />
			<Skeleton variant="text" size="md" />
			<Skeleton variant="text" size="lg" />
		</div>
	{/snippet}
</Story>

<Story name="Circular Variant">
	{#snippet template()}
		<div style="display: flex; gap: 24px; align-items: center;">
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Skeleton variant="circular" size="sm" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">sm (32px)</span>
			</div>
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Skeleton variant="circular" size="md" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">md (48px)</span>
			</div>
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Skeleton variant="circular" size="lg" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">lg (64px)</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Rectangular Variant">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
				<Skeleton variant="rectangular" size="sm" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">sm (100px)</span>
			</div>
			<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
				<Skeleton variant="rectangular" size="md" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">md (150px)</span>
			</div>
			<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
				<Skeleton variant="rectangular" size="lg" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">lg (200px)</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Custom Dimensions">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Skeleton variant="rectangular" width="100%" height={120} />
			<div style="display: flex; gap: 16px;">
				<Skeleton variant="circular" width={40} height={40} />
				<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
					<Skeleton variant="text" width="60%" />
					<Skeleton variant="text" width="40%" size="sm" />
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Rounded">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="display: flex; gap: 16px; align-items: center;">
				<Skeleton variant="rectangular" rounded width={100} height={100} />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);"
					>Rounded rectangular</span
				>
			</div>
			<Skeleton variant="text" rounded width="100%" />
		</div>
	{/snippet}
</Story>

<Story name="Card Loading">
	{#snippet template()}
		<div
			style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;"
		>
			{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
				<Card variant="outlined">
					<Skeleton variant="rectangular" height={150} style="border-radius: var(--radius-lg);" />
					<div style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
						<Skeleton variant="text" width="80%" />
						<Skeleton variant="text" width="60%" size="sm" />
						<div style="display: flex; gap: 8px; margin-top: 8px;">
							<Skeleton variant="text" width={60} size="sm" />
							<Skeleton variant="text" width={80} size="sm" />
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="List Loading">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			{#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
				<Card variant="filled" size="sm">
					<div style="display: flex; gap: 12px;">
						<Skeleton variant="circular" size="sm" />
						<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
							<Skeleton variant="text" width="40%" />
							<Skeleton variant="text" width="80%" size="sm" />
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="Profile Loading">
	{#snippet template()}
		<Card
			variant="elevated"
			style="display: flex; flex-direction: column; align-items: center; max-width: 320px; width: 100%;"
		>
			<Skeleton variant="circular" size="lg" />
			<div
				style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: center;"
			>
				<Skeleton variant="text" width="60%" />
				<Skeleton variant="text" width="80%" size="sm" />
			</div>
			<div style="margin-top: 16px; display: flex; gap: 24px;">
				<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
					<Skeleton variant="text" width={40} />
					<Skeleton variant="text" width={30} size="sm" />
				</div>
				<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
					<Skeleton variant="text" width={40} />
					<Skeleton variant="text" width={30} size="sm" />
				</div>
				<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
					<Skeleton variant="text" width={40} />
					<Skeleton variant="text" width={30} size="sm" />
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="Comparison With Real Content">
	{#snippet template()}
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
			<div>
				<h4 style="margin-bottom: 12px; color: var(--text-secondary);">Loading State</h4>
				<Card variant="outlined">
					<div style="display: flex; gap: 12px;">
						<Skeleton variant="circular" size="sm" />
						<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
							<Skeleton variant="text" width="50%" />
							<Skeleton variant="text" size="sm" />
						</div>
					</div>
				</Card>
			</div>
			<div>
				<h4 style="margin-bottom: 12px; color: var(--text-secondary);">Loaded State</h4>
				<Card variant="outlined">
					<div style="display: flex; gap: 12px;">
						<Avatar name="Alex Smith" size="sm" />
						<div style="display: flex; flex-direction: column;">
							<span style="font-weight: var(--font-medium);">Alex Smith</span>
							<span style="font-size: var(--text-sm); color: var(--text-tertiary);"
								>alex@example.com</span
							>
						</div>
					</div>
				</Card>
			</div>
		</div>
	{/snippet}
</Story>
