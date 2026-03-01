<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'Components/Badge',
		component: Badge,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'primary', 'success', 'warning', 'error']
			},
			size: { control: 'select', options: ['sm', 'md'] }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'primary', size: 'md' }}>Badge</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<Badge variant="default" size="sm">Default</Badge>
				<Badge variant="primary" size="sm">Primary</Badge>
				<Badge variant="success" size="sm">Success</Badge>
				<Badge variant="warning" size="sm">Warning</Badge>
				<Badge variant="error" size="sm">Error</Badge>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<Badge variant="default" size="md">Default</Badge>
				<Badge variant="primary" size="md">Primary</Badge>
				<Badge variant="success" size="md">Success</Badge>
				<Badge variant="warning" size="md">Warning</Badge>
				<Badge variant="error" size="md">Error</Badge>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Default">
	{#snippet template()}
		<div>
			<Badge variant="default" size="sm">Default</Badge>
			<Badge variant="default" size="md">Default</Badge>
		</div>
	{/snippet}
</Story>

<Story name="Primary">
	{#snippet template()}
		<div>
			<Badge variant="primary" size="sm">Primary</Badge>
			<Badge variant="primary" size="md">Primary</Badge>
		</div>
	{/snippet}
</Story>

<Story name="Success">
	{#snippet template()}
		<div>
			<Badge variant="success" size="sm">Success</Badge>
			<Badge variant="success" size="md">Success</Badge>
		</div>
	{/snippet}
</Story>

<Story name="Warning">
	{#snippet template()}
		<div>
			<Badge variant="warning" size="sm">Warning</Badge>
			<Badge variant="warning" size="md">Warning</Badge>
		</div>
	{/snippet}
</Story>

<Story name="Error">
	{#snippet template()}
		<div>
			<Badge variant="error" size="sm">Error</Badge>
			<Badge variant="error" size="md">Error</Badge>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">User Roles</h3>
			<div
				style="display: flex; gap: 12px; margin-bottom: 24px; align-items: center; flex-wrap: wrap;"
			>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-secondary);">Admin:</span>
					<Badge variant="success">ADMIN</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-secondary);">Moderator:</span>
					<Badge variant="warning">MODERATOR</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-secondary);">Member:</span>
					<Badge variant="default">MEMBER</Badge>
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Movie Status</h3>
			<div
				style="display: flex; gap: 12px; margin-bottom: 24px; align-items: center; flex-wrap: wrap;"
			>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-secondary);">Tracking:</span>
					<Badge variant="default" size="sm">Tracking</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-secondary);">Planned:</span>
					<Badge variant="primary" size="sm">Planned</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-secondary);">Watched:</span>
					<Badge variant="success" size="sm">Watched</Badge>
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">With Avatars</h3>
			<div
				style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<div style="display: flex; align-items: center; gap: 8px;">
					<div
						style="width: 32px; height: 32px; border-radius: 50%; background: var(--avatar-color-1); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; font-size: 12px;"
					>
						A
					</div>
					<span style="color: var(--text-primary);">Alex</span>
					<Badge variant="success" size="sm">ADMIN</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<div
						style="width: 32px; height: 32px; border-radius: 50%; background: var(--avatar-color-3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; font-size: 12px;"
					>
						M
					</div>
					<span style="color: var(--text-primary);">Maria</span>
					<Badge variant="warning" size="sm">MODERATOR</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<div
						style="width: 32px; height: 32px; border-radius: 50%; background: var(--avatar-color-5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; font-size: 12px;"
					>
						J
					</div>
					<span style="color: var(--text-primary);">John</span>
					<Badge variant="default" size="sm">MEMBER</Badge>
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Count Badge</h3>
			<div
				style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-primary);">Notifications</span>
					<Badge variant="primary" size="sm">5</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-primary);">New messages</span>
					<Badge variant="error" size="sm">12</Badge>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: var(--text-primary);">Tasks</span>
					<Badge variant="success" size="sm">3</Badge>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
