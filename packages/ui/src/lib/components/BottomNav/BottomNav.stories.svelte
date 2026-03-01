<script module lang="ts">
	import { House, User, Settings, Bell, Mail } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { NavItem } from './BottomNav.types.svelte';
	import BottomNav from './BottomNav.svelte';

	const { Story } = defineMeta({
		title: 'Components/BottomNav',
		component: BottomNav,
		tags: ['autodocs'],
		argTypes: {
			value: { control: 'text' },
			defaultValue: { control: 'text' }
		}
	});

	const defaultItems: NavItem[] = [
		{ id: 'home', label: 'Home', Icon: House, href: '/home' },
		{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' },
		{ id: 'settings', label: 'Settings', Icon: Settings, href: '/settings' }
	];

	let active = $state('home');
</script>

<Story name="Playground" args={{ items: defaultItems }} />

<Story name="Basic">
	{#snippet template()}
		<BottomNav items={defaultItems} />
	{/snippet}
</Story>

<Story name="With Badges">
	{#snippet template()}
		<BottomNav
			items={[
				{ id: 'home', label: 'Home', Icon: House, href: '/home' },
				{
					id: 'notifications',
					label: 'Notifications',
					Icon: Bell,
					href: '/notifications',
					badge: 5
				},
				{ id: 'messages', label: 'Messages', Icon: Mail, href: '/messages', badge: 99 },
				{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' }
			]}
			defaultValue="notifications"
		/>
	{/snippet}
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="padding: 16px; margin-bottom: 80px;">
			<p style="color: var(--text-secondary); margin-bottom: 8px;">
				Active tab: <strong>{active}</strong>
			</p>
			<BottomNav items={defaultItems} bind:value={active} />
		</div>
	{/snippet}
</Story>

<Story name="Hidden Items">
	{#snippet template()}
		<BottomNav
			items={[
				{ id: 'home', label: 'Home', Icon: House, href: '/home' },
				{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' },
				{ id: 'admin', label: 'Admin', Icon: Settings, href: '/admin', hidden: true }
			]}
		/>
	{/snippet}
</Story>

<Story name="Disabled Items">
	{#snippet template()}
		<BottomNav
			items={[
				{ id: 'home', label: 'Home', Icon: House, href: '/home' },
				{ id: 'search', label: 'Search', Icon: Bell, href: '/search', disabled: true },
				{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' }
			]}
			defaultValue="home"
		/>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<div style="max-width: 400px; margin: 0 auto; padding: 16px; padding-bottom: 80px;">
				<h2 style="margin-bottom: 16px;">My Groups</h2>
				<div
					style="background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px;"
				>
					<h3 style="margin-bottom: 8px;">Movie Club</h3>
					<p style="color: var(--text-secondary); font-size: var(--text-sm);">12 members</p>
				</div>
			</div>
			<BottomNav
				items={[
					{ id: 'home', label: 'Home', Icon: House, href: '/home', badge: 2 },
					{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' },
					{ id: 'settings', label: 'Settings', Icon: Settings, href: '/settings' }
				]}
				defaultValue="home"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Two Items">
	{#snippet template()}
		<BottomNav
			items={[
				{ id: 'home', label: 'Home', Icon: House, href: '/home' },
				{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' }
			]}
		/>
	{/snippet}
</Story>

<Story name="Five Items">
	{#snippet template()}
		<BottomNav
			items={[
				{ id: 'home', label: 'Home', Icon: House, href: '/home', badge: 3 },
				{ id: 'search', label: 'Search', Icon: Settings, href: '/search' },
				{
					id: 'notifications',
					label: 'Alerts',
					Icon: Bell,
					href: '/notifications',
					badge: 12
				},
				{ id: 'messages', label: 'Messages', Icon: Mail, href: '/messages' },
				{ id: 'profile', label: 'Profile', Icon: User, href: '/profile' }
			]}
		/>
	{/snippet}
</Story>
