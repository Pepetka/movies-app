<script module lang="ts">
	import { EllipsisVertical, Settings, Share, Heart, Search } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { IconButton } from '../IconButton';
	import TopBar from './TopBar.svelte';

	const { Story } = defineMeta({
		title: 'Components/TopBar',
		component: TopBar,
		tags: ['autodocs']
	});
</script>

<Story name="Playground" args={{ title: 'Page Title', showBack: false }} />

<Story name="Basic">
	{#snippet template()}
		<TopBar title="Page Title" />
	{/snippet}
</Story>

<Story name="With Back Button">
	{#snippet template()}
		<TopBar title="Settings" showBack />
	{/snippet}
</Story>

<Story name="With Actions">
	{#snippet template()}
		<TopBar title="Movies">
			{#snippet trailing()}
				<IconButton Icon={Search} label="Search" variant="ghost" size="md" />
				<IconButton Icon={Share} label="Share" variant="ghost" size="md" />
				<IconButton Icon={EllipsisVertical} label="More" variant="ghost" size="md" />
			{/snippet}
		</TopBar>
	{/snippet}
</Story>

<Story name="With Back Button And Actions">
	{#snippet template()}
		<TopBar title="Movie Details" showBack>
			{#snippet trailing()}
				<IconButton Icon={Heart} label="Favorite" variant="ghost" size="md" />
				<IconButton Icon={Share} label="Share" variant="ghost" size="md" />
			{/snippet}
		</TopBar>
	{/snippet}
</Story>

<Story name="With Custom Content">
	{#snippet template()}
		<TopBar>
			<div style="display: flex; align-items: center; gap: var(--space-3); flex: 1;">
				<img
					src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
					alt=""
					style="width: 32px; height: 32px; border-radius: var(--radius-md);"
				/>
				<div>
					<div style="font-weight: var(--font-semibold); color: var(--text-primary);">
						Group Name
					</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary);">5 members</div>
				</div>
			</div>
		</TopBar>
	{/snippet}
</Story>

<Story name="With Custom Leading">
	{#snippet template()}
		<TopBar title="Search Movies">
			{#snippet leading()}
				<IconButton Icon={Search} label="Search" variant="ghost" size="md" />
			{/snippet}
		</TopBar>
	{/snippet}
</Story>

<Story name="Long Title">
	{#snippet template()}
		<TopBar
			title="This is a very long page title that should be truncated with an ellipsis when it overflows"
		>
			{#snippet trailing()}
				<IconButton Icon={Settings} label="Settings" variant="ghost" size="md" />
			{/snippet}
		</TopBar>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="height: 400px; overflow-y: auto;">
			<TopBar title="Movies Library" showBack>
				{#snippet trailing()}
					<IconButton Icon={Search} label="Search" variant="ghost" size="md" />
					<IconButton Icon={EllipsisVertical} label="More" variant="ghost" size="md" />
				{/snippet}
			</TopBar>
			<div style="padding: var(--space-4);">
				<div
					style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--space-4);"
				>
					{#each Array.from({ length: 20 }, (_, i) => i + 1) as i (i)}
						<div
							style="aspect-ratio: 2/3; background: var(--bg-secondary); border-radius: var(--radius-lg);"
						></div>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context With Scroll">
	{#snippet template()}
		<div style="height: 300px; overflow-y: auto;">
			<TopBar title="Group Details">
				{#snippet trailing()}
					<IconButton Icon={Settings} label="Settings" variant="ghost" size="md" />
					<IconButton Icon={Share} label="Share" variant="ghost" size="md" />
				{/snippet}
			</TopBar>
			<div style="padding: var(--space-4);">
				<p style="color: var(--text-secondary); margin-bottom: var(--space-4);">
					Scroll down to see the sticky top bar behavior. The top bar will remain at the top of the
					container while the content scrolls beneath it.
				</p>
				{#each Array.from({ length: 20 }, (_, i) => i + 1) as num (num)}
					<div
						style="padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-secondary); border-radius: var(--radius-lg);"
					>
						Item {num}
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</Story>
