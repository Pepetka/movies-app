<script module lang="ts">
	import {
		X,
		House,
		User,
		Settings,
		Plus,
		Search,
		ChevronLeft,
		EllipsisVertical,
		Heart,
		Trash2,
		Share2
	} from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import IconButton from './IconButton.svelte';

	const { Story } = defineMeta({
		title: 'Components/IconButton',
		component: IconButton,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			variant: { control: 'select', options: ['ghost', 'secondary', 'primary'] }
		}
	});
</script>

<Story name="Playground" args={{ Icon: House, label: 'Home', size: 'md', variant: 'ghost' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<IconButton Icon={House} label="Home" size="sm" variant="ghost" />
				<IconButton Icon={User} label="Profile" size="sm" variant="secondary" />
				<IconButton Icon={Settings} label="Settings" size="sm" variant="primary" />
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<IconButton Icon={House} label="Home" size="md" variant="ghost" />
				<IconButton Icon={User} label="Profile" size="md" variant="secondary" />
				<IconButton Icon={Settings} label="Settings" size="md" variant="primary" />
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>lg</span
				>
				<IconButton Icon={House} label="Home" size="lg" variant="ghost" />
				<IconButton Icon={User} label="Profile" size="lg" variant="secondary" />
				<IconButton Icon={Settings} label="Settings" size="lg" variant="primary" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Primary">
	{#snippet template()}
		<div>
			<IconButton Icon={Plus} label="Add" size="sm" variant="primary" />
			<IconButton Icon={Plus} label="Add" size="md" variant="primary" />
			<IconButton Icon={Plus} label="Add" size="lg" variant="primary" />
		</div>
	{/snippet}
</Story>

<Story name="Secondary">
	{#snippet template()}
		<div>
			<IconButton Icon={House} label="Home" size="sm" variant="secondary" />
			<IconButton Icon={User} label="Profile" size="md" variant="secondary" />
			<IconButton Icon={Settings} label="Settings" size="lg" variant="secondary" />
		</div>
	{/snippet}
</Story>

<Story name="Ghost">
	{#snippet template()}
		<div>
			<IconButton Icon={House} label="Home" size="sm" variant="ghost" />
			<IconButton Icon={User} label="Profile" size="md" variant="ghost" />
			<IconButton Icon={Settings} label="Settings" size="lg" variant="ghost" />
		</div>
	{/snippet}
</Story>

<Story name="Common Icons">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Navigation</h3>
			<div style="display: flex; gap: 8px; margin-bottom: 24px;">
				<IconButton Icon={House} label="Home" variant="ghost" />
				<IconButton Icon={Search} label="Search" variant="ghost" />
				<IconButton Icon={ChevronLeft} label="Back" variant="ghost" />
				<IconButton Icon={Settings} label="Settings" variant="ghost" />
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Actions</h3>
			<div style="display: flex; gap: 8px; margin-bottom: 24px;">
				<IconButton Icon={Plus} label="Add" variant="primary" />
				<IconButton Icon={Heart} label="Favorite" variant="ghost" />
				<IconButton Icon={Share2} label="Share" variant="ghost" />
				<IconButton Icon={EllipsisVertical} label="More" variant="ghost" />
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Destructive</h3>
			<div style="display: flex; gap: 8px;">
				<IconButton Icon={X} label="Close" variant="ghost" />
				<IconButton Icon={Trash2} label="Delete" variant="ghost" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div>
			<IconButton Icon={House} label="Home" size="sm" variant="ghost" disabled />
			<IconButton Icon={User} label="Profile" size="md" variant="secondary" disabled />
			<IconButton Icon={Plus} label="Add" size="lg" variant="primary" disabled />
		</div>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>ghost</span
				>
				<IconButton Icon={House} label="Loading" size="md" variant="ghost" loading />
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>secondary</span
				>
				<IconButton Icon={User} label="Loading" size="md" variant="secondary" loading />
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>primary</span
				>
				<IconButton Icon={Plus} label="Loading" size="md" variant="primary" loading />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Loading All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<IconButton Icon={Plus} label="Loading" size="sm" variant="primary" loading />
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<IconButton Icon={Plus} label="Loading" size="md" variant="primary" loading />
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>lg</span
				>
				<IconButton Icon={Plus} label="Loading" size="lg" variant="primary" loading />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Header</h3>
			<div
				style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<span style="font-weight: var(--font-medium);">Settings</span>
				<div style="display: flex; gap: 8px;">
					<IconButton Icon={Search} label="Search" variant="ghost" />
					<IconButton Icon={EllipsisVertical} label="More options" variant="ghost" />
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Card Actions</h3>
			<div
				style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<div
					style="width: 48px; height: 48px; background: var(--bg-tertiary); border-radius: var(--radius-lg);"
				></div>
				<div style="flex: 1;">
					<div style="font-weight: var(--font-medium);">Movie Title</div>
					<div style="font-size: var(--text-sm); color: var(--text-tertiary);">1999 • 8.7</div>
				</div>
				<div style="display: flex; gap: 4px;">
					<IconButton Icon={Heart} label="Add to favorites" variant="ghost" />
					<IconButton Icon={Share2} label="Share" variant="ghost" />
					<IconButton Icon={EllipsisVertical} label="More" variant="ghost" />
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">FAB</h3>
			<div style="position: relative; height: 100px;">
				<IconButton
					Icon={Plus}
					label="Add new"
					size="lg"
					variant="primary"
					style="position: absolute; bottom: 0; right: 0;"
				/>
			</div>

			<h3 style="margin: 24px 0 16px 0; color: var(--text-secondary);">Loading State</h3>
			<div
				style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<span style="font-weight: var(--font-medium);">Saving changes...</span>
				<div style="display: flex; gap: 8px;">
					<IconButton Icon={Heart} label="Saving" variant="ghost" loading />
					<IconButton Icon={Plus} label="Adding" variant="primary" loading />
				</div>
			</div>
		</div>
	{/snippet}
</Story>
