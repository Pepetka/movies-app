<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Switch from './Switch.svelte';

	const { Story } = defineMeta({
		title: 'Components/Switch',
		component: Switch,
		tags: ['autodocs'],
		argTypes: {
			checked: { control: 'boolean' },
			disabled: { control: 'boolean' },
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			label: { control: 'text' },
			helper: { control: 'text' }
		}
	});
</script>

<!-- All Sizes -->
<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Switch size="sm" label="Small switch" />
			<Switch size="md" label="Medium switch" />
			<Switch size="lg" label="Large switch" />
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground" args={{ label: 'Enable notifications' }} />

<!-- Checked -->
<Story name="Checked" args={{ label: 'Enable notifications', checked: true }} />

<!-- With Helper -->
<Story
	name="With Helper"
	args={{ label: 'Email notifications', helper: 'Receive daily updates about your activity' }}
/>

<!-- Disabled -->
<Story name="Disabled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Switch label="Disabled unchecked" disabled={true} />
			<Switch label="Disabled checked" checked={true} disabled={true} />
		</div>
	{/snippet}
</Story>

<!-- Interactive -->
<Story name="Interactive" args={{ label: 'Toggle me', helper: 'Click to switch state' }} />

<!-- In Context -->
<Story name="In Context">
	{#snippet template()}
		<div style="max-width: 400px;">
			<div style="margin-bottom: 20px;">
				<h2 style="margin: 0 0 8px 0; font-size: 20px;">Settings</h2>
				<p style="margin: 0; color: var(--text-tertiary);">Manage your preferences</p>
			</div>

			<div style="display: flex; flex-direction: column; gap: 16px;">
				<Switch
					label="Push notifications"
					helper="Receive notifications on your device"
					checked={true}
				/>
				<Switch label="Email updates" helper="Weekly digest of your activity" />
				<Switch label="Dark mode" helper="Use dark theme across the app" />
				<Switch
					label="Analytics"
					helper="Help us improve by sharing anonymous usage data"
					size="sm"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<!-- All Sizes with Helpers -->
<Story name="Sizes With Helpers">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 20px;">
			<Switch size="sm" label="Small with helper" helper="This is a small switch" />
			<Switch
				size="md"
				label="Medium with helper"
				helper="This is a medium switch with helper text"
			/>
			<Switch
				size="lg"
				label="Large with helper"
				helper="This is a large switch with more prominent helper text"
			/>
		</div>
	{/snippet}
</Story>

<!-- Checked States by Size -->
<Story name="Checked By Size">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Switch size="sm" label="Small checked" checked={true} />
			<Switch size="md" label="Medium checked" checked={true} />
			<Switch size="lg" label="Large checked" checked={true} />
		</div>
	{/snippet}
</Story>

<!-- Accessibility -->
<Story name="Accessibility">
	{#snippet template()}
		<div style="max-width: 400px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>

			<div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
				<Switch
					label="Тёмная тема"
					helper="Нажмите Tab для фокуса, Space или Enter для переключения"
				/>
				<Switch label="Уведомления" checked={true} />
			</div>

			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Доступные клавиши:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Tab</kbd
						>
						<span style="color: var(--text-secondary);">Перемещение между переключателями</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Space</kbd
						>
						<span style="color: var(--text-secondary);">Переключение состояния</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Enter</kbd
						>
						<span style="color: var(--text-secondary);">Переключение состояния</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
