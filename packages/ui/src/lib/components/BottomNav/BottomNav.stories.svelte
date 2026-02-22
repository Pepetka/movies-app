<script module lang="ts">
	import { House, User, Settings, Bell, Mail } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import BottomNav from './BottomNav.svelte';

	const { Story } = defineMeta({
		title: 'Components/BottomNav',
		component: BottomNav,
		tags: ['autodocs']
	});
</script>

<Story name="Playground">
	{#snippet template()}
		<BottomNav
			items={[
				{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
				{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' },
				{ id: 'settings', label: 'Настройки', Icon: Settings, href: '/settings' }
			]}
		/>
	{/snippet}
</Story>

<Story name="Basic">
	{#snippet template()}
		<div>
			<BottomNav
				items={[
					{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
					{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' },
					{ id: 'settings', label: 'Настройки', Icon: Settings, href: '/settings' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Badges">
	{#snippet template()}
		<div>
			<BottomNav
				items={[
					{
						id: 'home',
						label: 'Группы',
						Icon: House,
						href: '/groups'
					},
					{
						id: 'notifications',
						label: 'Уведомления',
						Icon: Bell,
						href: '/notifications',
						badge: 5
					},
					{
						id: 'messages',
						label: 'Сообщения',
						Icon: Mail,
						href: '/messages',
						badge: 99
					},
					{
						id: 'profile',
						label: 'Профиль',
						Icon: User,
						href: '/profile'
					}
				]}
				defaultValue="notifications"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div>
			<div style="padding: 16px; margin-bottom: 300px;">
				<p style="color: var(--text-secondary); margin-bottom: 8px;">
					Active tab: <strong id="active-tab">home</strong>
				</p>
				<BottomNav
					items={[
						{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
						{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' },
						{ id: 'settings', label: 'Настройки', Icon: Settings, href: '/settings' }
					]}
					value="home"
					onChange={(id) => {
						document.getElementById('active-tab')!.textContent = id;
					}}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Hidden Items">
	{#snippet template()}
		<div>
			<p style="padding: 16px; color: var(--text-secondary);">
				Admin item is hidden (simulated admin-only access)
			</p>
			<BottomNav
				items={[
					{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
					{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' },
					{
						id: 'admin',
						label: 'Админ',
						Icon: Settings,
						href: '/admin',
						hidden: true
					}
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<div
				style="max-width: 400px; margin: 0 auto; padding-bottom: 80px; padding-left: 16px; padding-right: 16px;"
			>
				<h2 style="margin-bottom: 16px;">Мои группы</h2>
				<div
					style="background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px;"
				>
					<h3 style="margin-bottom: 8px;">Киноклуб 🎬</h3>
					<p style="color: var(--text-secondary); font-size: var(--text-sm);">
						12 участников • 5 активных
					</p>
				</div>
				<div
					style="background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px;"
				>
					<h3 style="margin-bottom: 8px;">Друзья</h3>
					<p style="color: var(--text-secondary); font-size: var(--text-sm);">
						4 участника • 2 активных
					</p>
				</div>
			</div>
			<BottomNav
				items={[
					{
						id: 'home',
						label: 'Группы',
						Icon: House,
						href: '/groups',
						badge: 2
					},
					{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' },
					{ id: 'settings', label: 'Настройки', Icon: Settings, href: '/settings' }
				]}
				defaultValue="home"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Two Items">
	{#snippet template()}
		<div>
			<BottomNav
				items={[
					{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
					{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Five Items">
	{#snippet template()}
		<div>
			<BottomNav
				items={[
					{ id: 'home', label: 'Группы', Icon: House, href: '/groups', badge: 3 },
					{ id: 'search', label: 'Поиск', Icon: Settings, href: '/search' },
					{
						id: 'notifications',
						label: 'Уведомления',
						Icon: Bell,
						href: '/notifications',
						badge: 12
					},
					{ id: 'messages', label: 'Сообщения', Icon: Mail, href: '/messages' },
					{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="All States">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 300px;">
				<p style="margin-bottom: 16px; color: var(--text-tertiary); font-size: var(--text-sm);">
					Normal state
				</p>
				<BottomNav
					items={[
						{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
						{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' },
						{ id: 'settings', label: 'Настройки', Icon: Settings, href: '/settings' }
					]}
					defaultValue="home"
				/>
			</div>

			<div style="margin-bottom: 300px;">
				<p style="margin-bottom: 16px; color: var(--text-tertiary); font-size: var(--text-sm);">
					With badges
				</p>
				<BottomNav
					items={[
						{ id: 'home', label: 'Группы', Icon: House, href: '/groups', badge: 2 },
						{
							id: 'notifications',
							label: 'Уведомления',
							Icon: Bell,
							href: '/notifications',
							badge: 99
						},
						{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' }
					]}
					defaultValue="home"
				/>
			</div>

			<div>
				<p style="margin-bottom: 16px; color: var(--text-tertiary); font-size: var(--text-sm);">
					With hidden items
				</p>
				<BottomNav
					items={[
						{ id: 'home', label: 'Группы', Icon: House, href: '/groups' },
						{ id: 'admin', label: 'Админ', Icon: Settings, href: '/admin', hidden: true },
						{ id: 'profile', label: 'Профиль', Icon: User, href: '/profile' }
					]}
					defaultValue="home"
				/>
			</div>
		</div>
	{/snippet}
</Story>
