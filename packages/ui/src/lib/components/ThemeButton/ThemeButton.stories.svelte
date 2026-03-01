<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ThemeButton from './ThemeButton.svelte';

	const { Story } = defineMeta({
		title: 'Components/ThemeButton',
		component: ThemeButton,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			labelEnableLight: { control: 'text' },
			labelEnableDark: { control: 'text' },
			titleLight: { control: 'text' },
			titleDark: { control: 'text' }
		}
	});

	const labels = {
		labelEnableLight: 'Включить светлую тему',
		labelEnableDark: 'Включить тёмную тему',
		titleLight: 'Светлая тема',
		titleDark: 'Тёмная тема'
	};
</script>

<Story name="Playground" args={{ size: 'md', ...labels }} />

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px;">
				<ThemeButton size="sm" {...labels} />
				<ThemeButton size="md" {...labels} />
				<ThemeButton size="lg" {...labels} />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Small">
	{#snippet template()}
		<div>
			<ThemeButton size="sm" {...labels} />
		</div>
	{/snippet}
</Story>

<Story name="Medium">
	{#snippet template()}
		<div>
			<ThemeButton size="md" {...labels} />
		</div>
	{/snippet}
</Story>

<Story name="Large">
	{#snippet template()}
		<div>
			<ThemeButton size="lg" {...labels} />
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Header with Theme Toggle</h3>
			<div
				style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<span style="font-weight: var(--font-medium);">Settings</span>
				<ThemeButton size="md" {...labels} />
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">User Profile Card</h3>
			<div
				style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<div style="display: flex; align-items: center; gap: 12px;">
					<div
						style="width: 48px; height: 48px; background: var(--bg-tertiary); border-radius: var(--radius-full);"
					></div>
					<div>
						<div style="font-weight: var(--font-medium);">Alex Smith</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
							alex@example.com
						</div>
					</div>
				</div>
				<ThemeButton size="sm" {...labels} />
			</div>
		</div>
	{/snippet}
</Story>
