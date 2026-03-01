<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { ThemeLabels } from './ThemeToggle.types.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const { Story } = defineMeta({
		title: 'Components/ThemeToggle',
		component: ThemeToggle,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			labels: { control: 'object' }
		}
	});

	const labels: ThemeLabels = {
		light: 'Светлая',
		dark: 'Тёмная',
		system: 'Системная',
		ariaLabel: 'Выбор темы'
	};
</script>

<Story name="Playground" args={{ size: 'md', labels }} />

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px; align-items: flex-start;">
				<ThemeToggle size="sm" {labels} />
				<ThemeToggle size="md" {labels} />
				<ThemeToggle size="lg" {labels} />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Small">
	{#snippet template()}
		<div>
			<ThemeToggle size="sm" {labels} />
		</div>
	{/snippet}
</Story>

<Story name="Medium">
	{#snippet template()}
		<div>
			<ThemeToggle size="md" {labels} />
		</div>
	{/snippet}
</Story>

<Story name="Large">
	{#snippet template()}
		<div>
			<ThemeToggle size="lg" {labels} />
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Settings Panel</h3>
			<div
				style="max-width: 400px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<h4 style="margin-bottom: 8px;">Appearance</h4>
				<p style="margin-bottom: 24px; color: var(--text-tertiary); font-size: var(--text-sm);">
					Choose your preferred theme. Select system to match your device settings.
				</p>
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<span style="font-weight: var(--font-medium);">Theme</span>
					<ThemeToggle size="md" {labels} />
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Compact Settings</h3>
			<div
				style="max-width: 300px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<span style="font-size: var(--text-sm);">Theme</span>
					<ThemeToggle size="sm" {labels} />
				</div>
			</div>
		</div>
	{/snippet}
</Story>
