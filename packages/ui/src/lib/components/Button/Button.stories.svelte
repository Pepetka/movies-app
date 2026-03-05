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
		<div style="display: flex; flex-direction: column; gap: var(--space-4);">
			<div style="display: flex; align-items: center; gap: var(--space-3);">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 32px;">sm</span>
				<Button variant="primary" size="sm">Primary</Button>
				<Button variant="secondary" size="sm">Secondary</Button>
				<Button variant="ghost" size="sm">Ghost</Button>
				<Button variant="danger" size="sm">Danger</Button>
			</div>
			<div style="display: flex; align-items: center; gap: var(--space-3);">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 32px;">md</span>
				<Button variant="primary" size="md">Primary</Button>
				<Button variant="secondary" size="md">Secondary</Button>
				<Button variant="ghost" size="md">Ghost</Button>
				<Button variant="danger" size="md">Danger</Button>
			</div>
			<div style="display: flex; align-items: center; gap: var(--space-3);">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 32px;">lg</span>
				<Button variant="primary" size="lg">Primary</Button>
				<Button variant="secondary" size="lg">Secondary</Button>
				<Button variant="ghost" size="lg">Ghost</Button>
				<Button variant="danger" size="lg">Danger</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-4);">
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Primary</h4>
				<div style="display: flex; gap: var(--space-2);">
					<Button variant="primary" size="sm">Small</Button>
					<Button variant="primary" size="md">Medium</Button>
					<Button variant="primary" size="lg">Large</Button>
				</div>
			</div>
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Secondary</h4>
				<div style="display: flex; gap: var(--space-2);">
					<Button variant="secondary" size="sm">Small</Button>
					<Button variant="secondary" size="md">Medium</Button>
					<Button variant="secondary" size="lg">Large</Button>
				</div>
			</div>
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Ghost</h4>
				<div style="display: flex; gap: var(--space-2);">
					<Button variant="ghost" size="sm">Small</Button>
					<Button variant="ghost" size="md">Medium</Button>
					<Button variant="ghost" size="lg">Large</Button>
				</div>
			</div>
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Danger</h4>
				<div style="display: flex; gap: var(--space-2);">
					<Button variant="danger" size="sm">Delete</Button>
					<Button variant="danger" size="md">Delete</Button>
					<Button variant="danger" size="lg">Delete</Button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="States">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6);">
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Disabled</h4>
				<div style="display: flex; gap: var(--space-2);">
					<Button variant="primary" size="sm" disabled>Primary</Button>
					<Button variant="secondary" size="md" disabled>Secondary</Button>
					<Button variant="ghost" size="lg" disabled>Ghost</Button>
					<Button variant="danger" size="md" disabled>Danger</Button>
				</div>
			</div>
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Loading</h4>
				<div style="display: flex; flex-direction: column; gap: var(--space-4);">
					<div style="display: flex; gap: var(--space-2);">
						<Button variant="primary" loading>Loading</Button>
						<Button variant="secondary" loading>Loading</Button>
						<Button variant="ghost" loading>Loading</Button>
						<Button variant="danger" loading>Loading</Button>
					</div>
					<div style="display: flex; gap: var(--space-2);">
						<Button variant="primary" size="sm" loading>Saving...</Button>
						<Button variant="secondary" size="md" loading>Processing</Button>
						<Button variant="ghost" size="lg" loading>Please wait...</Button>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Full Width">
	{#snippet template()}
		<div style="max-width: 400px; display: flex; flex-direction: column; gap: var(--space-2);">
			<Button variant="primary" fullWidth>Full Width Primary</Button>
			<Button variant="secondary" fullWidth>Full Width Secondary</Button>
		</div>
	{/snippet}
</Story>

<Story name="Link Buttons">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6);">
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">Internal Links</h4>
				<div style="display: flex; flex-wrap: wrap; gap: var(--space-3);">
					<Button variant="primary" href="/groups">Groups</Button>
					<Button variant="secondary" href="/movies">Movies</Button>
					<Button variant="ghost" href="/profile">Profile</Button>
				</div>
			</div>
			<div>
				<h4 style="margin: 0 0 var(--space-2); color: var(--text-secondary);">External Links</h4>
				<div style="display: flex; flex-wrap: wrap; gap: var(--space-3);">
					<Button
						variant="primary"
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub ↗
					</Button>
					<Button variant="secondary" href="https://docs.example.com" target="_blank">
						Documentation ↗
					</Button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6); max-width: 500px;">
			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Form Actions</h4>
				<div style="display: flex; gap: var(--space-3);">
					<Button variant="primary">Save Changes</Button>
					<Button variant="ghost">Cancel</Button>
				</div>
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Loading State</h4>
				<div style="display: flex; gap: var(--space-3);">
					<Button variant="primary" loading>Saving...</Button>
					<Button variant="secondary" loading>Loading data...</Button>
				</div>
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">
					Delete Confirmation
				</h4>
				<div
					style="padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<p style="margin: 0 0 var(--space-4); color: var(--text-secondary);">
						Are you sure you want to delete this item? This action cannot be undone.
					</p>
					<div style="display: flex; gap: var(--space-3);">
						<Button variant="danger">Delete</Button>
						<Button variant="ghost">Cancel</Button>
					</div>
				</div>
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Card Actions</h4>
				<div
					style="padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<h4 style="margin: 0 0 var(--space-2);">Movie Title</h4>
					<p style="margin: 0 0 var(--space-4); color: var(--text-tertiary);">
						1999 • 8.7 • 2h 16m
					</p>
					<div style="display: flex; gap: var(--space-2);">
						<Button variant="secondary" size="sm">Details</Button>
						<Button variant="ghost" size="sm">Edit</Button>
						<Button variant="ghost" size="sm">Delete</Button>
					</div>
				</div>
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Link vs Button</h4>
				<div style="display: flex; flex-direction: column; gap: var(--space-4);">
					<div>
						<p
							style="margin: 0 0 var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm);"
						>
							Link (can open in new tab)
						</p>
						<Button variant="primary" href="/groups">Go to Groups</Button>
					</div>
					<div>
						<p
							style="margin: 0 0 var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm);"
						>
							Button (performs action)
						</p>
						<Button variant="primary" onclick={() => alert('Action!')}>Create Group</Button>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
