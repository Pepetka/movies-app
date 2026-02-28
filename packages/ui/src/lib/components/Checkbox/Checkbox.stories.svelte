<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { CheckboxSize } from './Checkbox.types.svelte';
	import Checkbox from './Checkbox.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		argTypes: {
			checked: { control: 'boolean' },
			disabled: { control: 'boolean' },
			size: { control: 'select', options: ['sm', 'md', 'lg'] as CheckboxSize[] },
			label: { control: 'text' },
			helper: { control: 'text' },
			error: { control: 'text' },
			indeterminate: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ label: 'Accept terms and conditions' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Checkbox size="sm" label="Small checkbox" />
			<Checkbox size="md" label="Medium checkbox" />
			<Checkbox size="lg" label="Large checkbox" />
		</div>
	{/snippet}
</Story>

<Story name="States">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Checkbox label="Unchecked" />
			<Checkbox label="Checked" checked={true} />
			<Checkbox label="Indeterminate" indeterminate={true} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Helper"
	args={{
		label: 'Marketing emails',
		helper: 'Receive updates about new features and promotions'
	}}
/>

<Story name="Error State">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Checkbox label="Accept terms" error="You must accept the terms to continue" />
			<Checkbox label="Confirm age" checked={true} error="Age confirmation is required" />
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Checkbox label="Disabled unchecked" disabled={true} />
			<Checkbox label="Disabled checked" checked={true} disabled={true} />
			<Checkbox label="Disabled indeterminate" indeterminate={true} disabled={true} />
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="max-width: 400px;">
			<div style="margin-bottom: 20px;">
				<h2 style="margin: 0 0 8px 0; font-size: 20px;">Select Features</h2>
				<p style="margin: 0; color: var(--text-tertiary);">Choose which features to enable</p>
			</div>

			<div style="display: flex; flex-direction: column; gap: 16px;">
				<Checkbox label="Dark mode" helper="Use dark theme across the application" checked={true} />
				<Checkbox
					label="Auto-save"
					helper="Automatically save your work every 5 minutes"
					checked={true}
				/>
				<Checkbox label="Desktop notifications" helper="Get notified about important updates" />
				<Checkbox
					label="Analytics"
					helper="Help us improve by sharing anonymous usage data"
					size="sm"
				/>
				<Checkbox
					label="Beta features"
					helper="Try experimental features before official release"
					indeterminate={true}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Sizes With States">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<div>
				<p style="margin: 0 0 8px 0; font-weight: 500;">Small</p>
				<div style="display: flex; gap: 24px;">
					<Checkbox size="sm" label="Unchecked" />
					<Checkbox size="sm" label="Checked" checked={true} />
					<Checkbox size="sm" label="Indeterminate" indeterminate={true} />
				</div>
			</div>
			<div>
				<p style="margin: 0 0 8px 0; font-weight: 500;">Medium</p>
				<div style="display: flex; gap: 24px;">
					<Checkbox size="md" label="Unchecked" />
					<Checkbox size="md" label="Checked" checked={true} />
					<Checkbox size="md" label="Indeterminate" indeterminate={true} />
				</div>
			</div>
			<div>
				<p style="margin: 0 0 8px 0; font-weight: 500;">Large</p>
				<div style="display: flex; gap: 24px;">
					<Checkbox size="lg" label="Unchecked" />
					<Checkbox size="lg" label="Checked" checked={true} />
					<Checkbox size="lg" label="Indeterminate" indeterminate={true} />
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="max-width: 400px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>

			<div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
				<Checkbox
					label="Согласен с условиями"
					helper="Нажмите Tab для фокуса, Space для переключения"
				/>
				<Checkbox label="Получать уведомления" checked={true} />
			</div>

			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Доступные клавиши:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Tab</kbd
						>
						<span style="color: var(--text-secondary);">Перемещение между чекбоксами</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Space</kbd
						>
						<span style="color: var(--text-secondary);">Переключение состояния</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Enter</kbd
						>
						<span style="color: var(--text-secondary);">Переключение состояния (альтернатива)</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
