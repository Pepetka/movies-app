<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
			size: { control: 'select', options: ['sm', 'md', 'lg'] }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'primary', size: 'md' }}>Button</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<Button variant="primary" size="sm">Small</Button>
				<Button variant="secondary" size="sm">Small</Button>
				<Button variant="ghost" size="sm">Small</Button>
				<Button variant="danger" size="sm">Small</Button>
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<Button variant="primary" size="md">Medium</Button>
				<Button variant="secondary" size="md">Medium</Button>
				<Button variant="ghost" size="md">Medium</Button>
				<Button variant="danger" size="md">Medium</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>lg</span
				>
				<Button variant="primary" size="lg">Large</Button>
				<Button variant="secondary" size="lg">Large</Button>
				<Button variant="ghost" size="lg">Large</Button>
				<Button variant="danger" size="lg">Large</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Primary">
	{#snippet template()}
		<div>
			<Button variant="primary" size="sm">Small Primary</Button>
			<Button variant="primary" size="md">Medium Primary</Button>
			<Button variant="primary" size="lg">Large Primary</Button>
		</div>
	{/snippet}
</Story>

<Story name="Secondary">
	{#snippet template()}
		<div>
			<Button variant="secondary" size="sm">Small Secondary</Button>
			<Button variant="secondary" size="md">Medium Secondary</Button>
			<Button variant="secondary" size="lg">Large Secondary</Button>
		</div>
	{/snippet}
</Story>

<Story name="Ghost">
	{#snippet template()}
		<div>
			<Button variant="ghost" size="sm">Small Ghost</Button>
			<Button variant="ghost" size="md">Medium Ghost</Button>
			<Button variant="ghost" size="lg">Large Ghost</Button>
		</div>
	{/snippet}
</Story>

<Story name="Danger">
	{#snippet template()}
		<div>
			<Button variant="danger" size="sm">Delete</Button>
			<Button variant="danger" size="md">Delete</Button>
			<Button variant="danger" size="lg">Delete</Button>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div>
			<Button variant="primary" size="sm" disabled>Primary</Button>
			<Button variant="secondary" size="md" disabled>Secondary</Button>
			<Button variant="ghost" size="lg" disabled>Ghost</Button>
			<Button variant="danger" size="md" disabled>Danger</Button>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Form Actions</h3>
			<div style="display: flex; gap: 12px; margin-bottom: 24px;">
				<Button variant="primary">Save Changes</Button>
				<Button variant="ghost">Cancel</Button>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Delete Confirmation</h3>
			<div
				style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<p style="margin-bottom: 16px; color: var(--text-secondary);">
					Are you sure you want to delete this item? This action cannot be undone.
				</p>
				<div style="display: flex; gap: 12px;">
					<Button variant="danger">Delete</Button>
					<Button variant="ghost">Cancel</Button>
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Card Actions</h3>
			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<h4 style="margin-bottom: 8px;">Movie Title</h4>
				<p style="margin-bottom: 16px; color: var(--text-tertiary);">1999 • 8.7 • 2h 16m</p>
				<div style="display: flex; gap: 8px;">
					<Button variant="secondary" size="sm">Details</Button>
					<Button variant="ghost" size="sm">Edit</Button>
					<Button variant="ghost" size="sm">Delete</Button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Full Width">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Button variant="primary" fullWidth>Full Width Button</Button>
		</div>
	{/snippet}
</Story>
