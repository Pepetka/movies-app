<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { DividerOrientation } from './Divider.types.svelte';
	import ListItem from '../List/ListItem.svelte';
	import Button from '../Button/Button.svelte';
	import Divider from './Divider.svelte';
	import Card from '../Card/Card.svelte';

	const { Story } = defineMeta({
		title: 'Components/Divider',
		component: Divider,
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: 'select',
				options: ['horizontal', 'vertical'] as DividerOrientation[]
			},
			inset: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ orientation: 'horizontal', inset: false }} />

<Story name="Horizontal">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
			<div>
				<h3 style="margin: 0 0 8px 0;">Section 1</h3>
				<p style="margin: 0; color: var(--text-secondary);">Content for the first section.</p>
			</div>
			<Divider />
			<div>
				<h3 style="margin: 0 0 8px 0;">Section 2</h3>
				<p style="margin: 0; color: var(--text-secondary);">Content for the second section.</p>
			</div>
			<Divider />
			<div>
				<h3 style="margin: 0 0 8px 0;">Section 3</h3>
				<p style="margin: 0; color: var(--text-secondary);">Content for the third section.</p>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Inset">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; gap: 16px; max-width: 400px; padding: 16px; background-color: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<div>
				<h3 style="margin: 0 0 8px 0;">Section 1</h3>
				<p style="margin: 0; color: var(--text-secondary);">Content for the first section.</p>
			</div>
			<Divider inset />
			<div>
				<h3 style="margin: 0 0 8px 0;">Section 2</h3>
				<p style="margin: 0; color: var(--text-secondary);">Content for the second section.</p>
			</div>
			<Divider inset />
			<div>
				<h3 style="margin: 0 0 8px 0;">Section 3</h3>
				<p style="margin: 0; color: var(--text-secondary);">Content for the third section.</p>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Vertical">
	{#snippet template()}
		<div style="display: flex; align-items: center; gap: 24px; height: 120px;">
			<div style="flex: 1; text-align: center;">
				<h3 style="margin: 0;">Left</h3>
				<p style="margin: 4px 0 0 0; color: var(--text-secondary);">Content</p>
			</div>
			<Divider orientation="vertical" />
			<div style="flex: 1; text-align: center;">
				<h3 style="margin: 0;">Middle</h3>
				<p style="margin: 4px 0 0 0; color: var(--text-secondary);">Content</p>
			</div>
			<Divider orientation="vertical" />
			<div style="flex: 1; text-align: center;">
				<h3 style="margin: 0;">Right</h3>
				<p style="margin: 4px 0 0 0; color: var(--text-secondary);">Content</p>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Vertical Inset">
	{#snippet template()}
		<div
			style="display: flex; align-items: center; gap: 24px; height: 160px; padding: 16px; background-color: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<div style="flex: 1; text-align: center;">
				<h3 style="margin: 0;">Left</h3>
			</div>
			<Divider orientation="vertical" inset />
			<div style="flex: 1; text-align: center;">
				<h3 style="margin: 0;">Middle</h3>
			</div>
			<Divider orientation="vertical" inset />
			<div style="flex: 1; text-align: center;">
				<h3 style="margin: 0;">Right</h3>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context - Cards">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 0; max-width: 400px;">
			<Card variant="elevated" size="md">
				<h3 style="margin: 0 0 8px 0;">Card 1</h3>
				<p style="margin: 0; color: var(--text-secondary);">First card content.</p>
			</Card>
			<Divider inset />
			<Card variant="elevated" size="md">
				<h3 style="margin: 0 0 8px 0;">Card 2</h3>
				<p style="margin: 0; color: var(--text-secondary);">Second card content.</p>
			</Card>
			<Divider inset />
			<Card variant="elevated" size="md">
				<h3 style="margin: 0 0 8px 0;">Card 3</h3>
				<p style="margin: 0; color: var(--text-secondary);">Third card content.</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="In Context - List Items">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; gap: 0; max-width: 400px; padding: 8px; background-color: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<ListItem title="Item 1" />
			<Divider inset />
			<ListItem title="Item 2" />
			<Divider inset />
			<ListItem title="Item 3" />
		</div>
	{/snippet}
</Story>

<Story name="In Context - Form Actions">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
			<div>
				<h3 style="margin: 0 0 16px 0;">Form Actions</h3>
				<div style="display: flex; gap: 8px; justify-content: flex-end;">
					<Button variant="ghost">Cancel</Button>
					<Button variant="secondary">Save Draft</Button>
					<Button>Submit</Button>
				</div>
			</div>
			<Divider />
			<div>
				<h3 style="margin: 0 0 16px 0;">Another Section</h3>
				<p style="margin: 0; color: var(--text-secondary);">More content below the divider.</p>
			</div>
		</div>
	{/snippet}
</Story>
