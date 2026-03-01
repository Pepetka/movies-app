<script module lang="ts">
	import { Settings, User, Bell, Lock, Eye, LogOut, Film, Star } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ListItem from './ListItem.svelte';
	import { Avatar } from '../Avatar';
	import List from './List.svelte';
	import { Badge } from '../Badge';

	const { Story } = defineMeta({
		title: 'Components/List',
		component: List,
		tags: ['autodocs'],
		argTypes: {
			dividers: { control: 'boolean' },
			variant: { control: 'select', options: ['plain', 'outlined', 'filled'] },
			ordered: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ dividers: true, variant: 'outlined', ordered: false }}>
	{#snippet template(args)}
		<List {...args}>
			<ListItem title="Item 1" subtitle="First item" />
			<ListItem title="Item 2" subtitle="Second item" />
			<ListItem title="Item 3" subtitle="Third item" />
		</List>
	{/snippet}
</Story>

<Story name="Basic">
	{#snippet template()}
		<List>
			<ListItem title="Settings" subtitle="Manage your preferences" />
			<ListItem title="Profile" subtitle="View your profile" />
			<ListItem title="Notifications" subtitle="Configure notifications" />
		</List>
	{/snippet}
</Story>

<Story name="With Leading">
	{#snippet template()}
		<List variant="outlined">
			<ListItem title="John Doe" subtitle="john@example.com">
				{#snippet leading()}
					<Avatar name="John Doe" size="md" />
				{/snippet}
			</ListItem>
			<ListItem title="Jane Smith" subtitle="jane@example.com">
				{#snippet leading()}
					<Avatar name="Jane Smith" size="md" />
				{/snippet}
			</ListItem>
			<ListItem title="Bob Johnson" subtitle="bob@example.com">
				{#snippet leading()}
					<Avatar name="Bob Johnson" size="md" />
				{/snippet}
			</ListItem>
		</List>
	{/snippet}
</Story>

<Story name="With Trailing">
	{#snippet template()}
		<List variant="outlined">
			<ListItem
				title="Email Notifications"
				subtitle="Receive email updates"
				interactive={true}
				showChevron={true}
			/>
			<ListItem
				title="Push Notifications"
				subtitle="Receive push notifications"
				interactive={true}
				showChevron={true}
			/>
			<ListItem title="Messages" subtitle="3 unread" interactive={true} showChevron={true}>
				{#snippet trailing()}
					<Badge variant="primary">3</Badge>
				{/snippet}
			</ListItem>
		</List>
	{/snippet}
</Story>

<Story name="Interactive Items">
	{#snippet template()}
		<List variant="outlined">
			<ListItem
				title="Profile"
				subtitle="Manage your account"
				interactive={true}
				showChevron={true}
			>
				{#snippet leading()}
					<User size={20} />
				{/snippet}
			</ListItem>
			<ListItem
				title="Settings"
				subtitle="Configure preferences"
				interactive={true}
				showChevron={true}
			>
				{#snippet leading()}
					<Settings size={20} />
				{/snippet}
			</ListItem>
			<ListItem
				title="Notifications"
				subtitle="Manage alerts"
				interactive={true}
				showChevron={true}
			>
				{#snippet leading()}
					<Bell size={20} />
				{/snippet}
			</ListItem>
		</List>
	{/snippet}
</Story>

<Story name="Disabled State">
	{#snippet template()}
		<List variant="outlined">
			<ListItem interactive={true} showChevron={true} title="Active Item" subtitle="Clickable" />
			<ListItem
				interactive={true}
				disabled={true}
				showChevron={true}
				title="Disabled Item"
				subtitle="Not clickable"
			/>
			<ListItem interactive={true} showChevron={true} title="Another Active" subtitle="Clickable" />
		</List>
	{/snippet}
</Story>

<Story name="Without Dividers">
	{#snippet template()}
		<List dividers={false} variant="outlined">
			<ListItem title="Item 1" subtitle="No divider below" />
			<ListItem title="Item 2" subtitle="Clean look" />
			<ListItem title="Item 3" subtitle="Minimal design" />
		</List>
	{/snippet}
</Story>

<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<h3 style="margin: 0; color: var(--text-secondary);">Plain</h3>
			<List variant="plain">
				<ListItem title="Plain Item 1" subtitle="No background" />
				<ListItem title="Plain Item 2" subtitle="Transparent" />
			</List>

			<h3 style="margin: 0; color: var(--text-secondary);">Outlined</h3>
			<List variant="outlined">
				<ListItem title="Outlined Item 1" subtitle="With border" />
				<ListItem title="Outlined Item 2" subtitle="Container style" />
			</List>

			<h3 style="margin: 0; color: var(--text-secondary);">Filled</h3>
			<List variant="filled">
				<ListItem title="Filled Item 1" subtitle="With background" />
				<ListItem title="Filled Item 2" subtitle="Secondary background" />
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<h3 style="margin: 0; color: var(--text-secondary);">Small</h3>
			<List variant="outlined">
				<ListItem size="sm" title="Small Item 1" subtitle="Compact size" />
				<ListItem size="sm" title="Small Item 2" subtitle="40px min-height" />
			</List>

			<h3 style="margin: 0; color: var(--text-secondary);">Medium</h3>
			<List variant="outlined">
				<ListItem size="md" title="Medium Item 1" subtitle="Default size" />
				<ListItem size="md" title="Medium Item 2" subtitle="48px min-height" />
			</List>

			<h3 style="margin: 0; color: var(--text-secondary);">Large</h3>
			<List variant="outlined">
				<ListItem size="lg" title="Large Item 1" subtitle="Featured content" />
				<ListItem size="lg" title="Large Item 2" subtitle="56px min-height" />
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Ordered List">
	{#snippet template()}
		<List ordered={true} variant="outlined">
			<ListItem title="Create an account" subtitle="Sign up for free" />
			<ListItem title="Browse movies" subtitle="Explore our catalog" />
			<ListItem title="Join a group" subtitle="Connect with friends" />
			<ListItem title="Start watching" subtitle="Enjoy your favorites" />
		</List>
	{/snippet}
</Story>

<Story name="All States">
	{#snippet template()}
		<List variant="outlined">
			<ListItem interactive={true} showChevron={true} title="Interactive" subtitle="Clickable" />
			<ListItem
				interactive={true}
				disabled={true}
				showChevron={true}
				title="Disabled"
				subtitle="Not clickable"
			/>
			<ListItem title="Non-interactive" subtitle="Regular item" />
			<ListItem interactive={true} showChevron={true} title="With Badge">
				{#snippet trailing()}
					<Badge variant="primary">New</Badge>
				{/snippet}
			</ListItem>
			<ListItem
				title="With Description"
				subtitle="Subtitle here"
				description="Third line of text"
			/>
		</List>
	{/snippet}
</Story>

<Story name="In Context: Settings List">
	{#snippet template()}
		<div style="max-width: 400px;">
			<h2 style="margin: 0 0 16px 0;">Settings</h2>
			<List variant="outlined">
				<ListItem
					title="Account"
					subtitle="Personal information, password"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<User size={20} />
					{/snippet}
				</ListItem>
				<ListItem
					title="Notifications"
					subtitle="Alerts, sounds, badges"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Bell size={20} />
					{/snippet}
				</ListItem>
				<ListItem
					title="Privacy"
					subtitle="Data, permissions, security"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Lock size={20} />
					{/snippet}
				</ListItem>
				<ListItem
					title="Appearance"
					subtitle="Theme, display, language"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Eye size={20} />
					{/snippet}
				</ListItem>
			</List>

			<h2 style="margin: 24px 0 16px 0;">Danger Zone</h2>
			<List variant="outlined">
				<ListItem title="Log Out" interactive={true}>
					{#snippet leading()}
						<LogOut size={20} />
					{/snippet}
				</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="In Context: User List">
	{#snippet template()}
		<div style="max-width: 500px;">
			<h2 style="margin: 0 0 16px 0;">Team Members</h2>
			<List variant="outlined">
				<ListItem
					title="Alice Cooper"
					subtitle="alice@example.com"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Avatar name="Alice Cooper" size="md" />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="success">Admin</Badge>
					{/snippet}
				</ListItem>
				<ListItem
					title="Bob Martin"
					subtitle="bob@example.com"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Avatar name="Bob Martin" size="md" />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="default">Member</Badge>
					{/snippet}
				</ListItem>
				<ListItem
					title="Carol White"
					subtitle="carol@example.com"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Avatar name="Carol White" size="md" />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="default">Member</Badge>
					{/snippet}
				</ListItem>
				<ListItem
					title="David Brown"
					subtitle="david@example.com"
					interactive={true}
					showChevron={true}
				>
					{#snippet leading()}
						<Avatar name="David Brown" size="md" />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="default">Member</Badge>
					{/snippet}
				</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="In Context: Movie List">
	{#snippet template()}
		<div style="max-width: 500px;">
			<h2 style="margin: 0 0 16px 0;">Watchlist</h2>
			<List variant="outlined">
				<ListItem
					title="The Shawshank Redemption"
					subtitle="1999 • Drama"
					description="Two imprisoned men bond over a number of years."
					interactive={true}
					showChevron={true}
					size="lg"
				>
					{#snippet leading()}
						<Film size={24} />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="primary" style="display: flex; gap: 4px; align-items: center;">
							<Star size={12} fill="currentColor" /> 9.3
						</Badge>
					{/snippet}
				</ListItem>
				<ListItem
					title="The Godfather"
					subtitle="1972 • Crime, Drama"
					description="The aging patriarch of an organized crime dynasty transfers control to his son."
					interactive={true}
					showChevron={true}
					size="lg"
				>
					{#snippet leading()}
						<Film size={24} />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="primary" style="display: flex; gap: 4px; align-items: center;">
							<Star size={12} fill="currentColor" /> 9.2
						</Badge>
					{/snippet}
				</ListItem>
				<ListItem
					title="The Dark Knight"
					subtitle="2008 • Action, Crime, Drama"
					description="Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent."
					interactive={true}
					showChevron={true}
					size="lg"
				>
					{#snippet leading()}
						<Film size={24} />
					{/snippet}
					{#snippet trailing()}
						<Badge variant="primary" style="display: flex; gap: 4px; align-items: center;">
							<Star size={12} fill="currentColor" /> 9.0
						</Badge>
					{/snippet}
				</ListItem>
			</List>
		</div>
	{/snippet}
</Story>
