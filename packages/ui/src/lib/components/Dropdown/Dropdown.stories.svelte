<script module lang="ts">
	import { MoreVertical, Settings, User, LogOut, Bell, Edit, Trash2, Share2 } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ListItem from '../List/ListItem.svelte';
	import { IconButton } from '../IconButton';
	import Dropdown from './Dropdown.svelte';
	import List from '../List/List.svelte';

	const { Story } = defineMeta({
		title: 'Components/Dropdown',
		component: Dropdown,
		tags: ['autodocs'],
		argTypes: {
			position: {
				control: 'select',
				options: ['bottom-start', 'bottom-end', 'top-start', 'top-end']
			},
			closeOnClick: { control: 'boolean' },
			closeOnEscape: { control: 'boolean' }
		}
	});
</script>

<Story
	name="Playground"
	args={{ position: 'bottom-start', closeOnClick: true, closeOnEscape: true }}
>
	{#snippet template(args)}
		<div style="padding: 120px 120px;">
			<Dropdown {...args}>
				<IconButton Icon={MoreVertical} size="md" variant="ghost" label="Menu" />
				{#snippet items()}
					<List variant="plain" style="white-space: nowrap;">
						<ListItem title="Edit" interactive size="sm">
							{#snippet leading()}
								<Edit size={16} />
							{/snippet}
						</ListItem>
						<ListItem title="Share" interactive size="sm">
							{#snippet leading()}
								<Share2 size={16} />
							{/snippet}
						</ListItem>
						<ListItem title="Delete" interactive size="sm">
							{#snippet leading()}
								<Trash2 size={16} />
							{/snippet}
						</ListItem>
					</List>
				{/snippet}
			</Dropdown>
		</div>
	{/snippet}
</Story>

<Story name="With Icons">
	{#snippet template()}
		<Dropdown position="bottom-start">
			<IconButton Icon={MoreVertical} size="md" variant="ghost" label="Actions" />
			{#snippet items()}
				<List variant="plain" style="white-space: nowrap;">
					<ListItem title="Edit" interactive size="sm">
						{#snippet leading()}
							<Edit size={16} />
						{/snippet}
					</ListItem>
					<ListItem title="Share" interactive size="sm">
						{#snippet leading()}
							<Share2 size={16} />
						{/snippet}
					</ListItem>
					<ListItem title="Delete" interactive size="sm">
						{#snippet leading()}
							<Trash2 size={16} />
						{/snippet}
					</ListItem>
				</List>
			{/snippet}
		</Dropdown>
	{/snippet}
</Story>

<Story name="User Menu">
	{#snippet template()}
		<Dropdown position="bottom-start">
			<IconButton Icon={MoreVertical} size="md" variant="ghost" label="User menu" />
			{#snippet items()}
				<List variant="plain" style="white-space: nowrap;">
					<ListItem title="Profile" subtitle="View your profile" interactive size="sm">
						{#snippet leading()}
							<User size={16} />
						{/snippet}
					</ListItem>
					<ListItem title="Settings" subtitle="Manage preferences" interactive size="sm">
						{#snippet leading()}
							<Settings size={16} />
						{/snippet}
					</ListItem>
					<ListItem title="Notifications" subtitle="Alerts & sounds" interactive size="sm">
						{#snippet leading()}
							<Bell size={16} />
						{/snippet}
					</ListItem>
					<ListItem title="Log Out" interactive size="sm">
						{#snippet leading()}
							<LogOut size={16} />
						{/snippet}
					</ListItem>
				</List>
			{/snippet}
		</Dropdown>
	{/snippet}
</Story>

<Story name="Without Auto-Close" args={{ closeOnClick: false, position: 'bottom-start' }}>
	{#snippet template(args)}
		<Dropdown {...args}>
			<IconButton Icon={MoreVertical} size="md" variant="ghost" label="Menu" />
			{#snippet items()}
				<List variant="plain" style="white-space: nowrap;">
					<ListItem title="Option A" interactive size="sm" />
					<ListItem title="Option B" interactive size="sm" />
					<ListItem title="Option C" interactive size="sm" />
				</List>
			{/snippet}
		</Dropdown>
	{/snippet}
</Story>
