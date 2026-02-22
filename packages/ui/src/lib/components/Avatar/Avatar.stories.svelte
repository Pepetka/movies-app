<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { AvatarSize } from './Avatar.types.svelte';
	import Avatar from './Avatar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Avatar',
		component: Avatar,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] as AvatarSize[] }
		}
	});
</script>

<Story name="Playground" args={{ name: 'Alex' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: center;">
			<Avatar name="Alex" size="xs" />
			<Avatar name="Alex" size="sm" />
			<Avatar name="Alex" size="md" />
			<Avatar name="Alex" size="lg" />
			<Avatar name="Alex" size="xl" />
		</div>
	{/snippet}
</Story>

<Story name="With Image">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: center;">
			<Avatar
				src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
				name="Alex Smith"
				size="sm"
			/>
			<Avatar
				src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
				name="Maria Johnson"
				size="md"
			/>
			<Avatar
				src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
				name="John Williams"
				size="lg"
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Initials">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
			<Avatar name="Alex" size="md" />
			<Avatar name="Maria Johnson" size="md" />
			<Avatar name="John Williams" size="md" />
			<Avatar name="Анна Петрова" size="md" />
			<Avatar name="Иван" size="md" />
			<Avatar name="Movies Group" size="md" />
			<Avatar name="Best Films Ever" size="md" />
		</div>
	{/snippet}
</Story>

<Story name="With Icon Fallback">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: center;">
			<Avatar size="xs" />
			<Avatar size="sm" />
			<Avatar size="md" />
			<Avatar size="lg" />
			<Avatar size="xl" />
		</div>
	{/snippet}
</Story>

<Story name="Image Error Fallback">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: center;">
			<Avatar src="wrongprotocol://invalid-url.com/image.jpg" name="Alex" size="sm" />
			<Avatar src="wrongprotocol://invalid-url.com/image.jpg" name="Maria Johnson" size="md" />
			<Avatar src="wrongprotocol://invalid-url.com/image.jpg" name="John Williams" size="lg" />
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">User List</h3>
			<div style="display: flex; flex-direction: column; gap: 12px;">
				<div
					style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<Avatar
						src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
						name="Alex Smith"
						size="md"
					/>
					<div>
						<div style="font-weight: var(--font-medium);">Alex Smith</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
							alex@example.com
						</div>
					</div>
				</div>
				<div
					style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<Avatar name="Maria Johnson" size="md" />
					<div>
						<div style="font-weight: var(--font-medium);">Maria Johnson</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
							maria@example.com
						</div>
					</div>
				</div>
			</div>

			<h3 style="margin: 24px 0 16px; color: var(--text-secondary);">Group Members</h3>
			<div
				style="display: flex; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<div style="display: flex; margin-left: 12px;">
					<Avatar name="Alex" size="sm" style="margin-left: -8px;" />
					<Avatar name="Maria" size="sm" style="margin-left: -8px;" />
					<Avatar name="John" size="sm" style="margin-left: -8px;" />
					<Avatar name="Anna" size="sm" style="margin-left: -8px;" />
					<Avatar name="+5" size="sm" style="margin-left: -8px; background: var(--bg-tertiary);" />
				</div>
				<span style="margin-left: 16px; font-size: var(--text-sm); color: var(--text-secondary);"
					>8 members</span
				>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Sizes Comparison">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">xs</span>
				<Avatar name="Alex" size="xs" />
				<Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" name="Alex" size="xs" />
			</div>
			<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">sm</span>
				<Avatar name="Alex" size="sm" />
				<Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" name="Alex" size="sm" />
			</div>
			<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">md</span>
				<Avatar name="Alex" size="md" />
				<Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" name="Alex" size="md" />
			</div>
			<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">lg</span>
				<Avatar name="Alex" size="lg" />
				<Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" name="Alex" size="lg" />
			</div>
			<div style="display: flex; gap: 8px; align-items: center;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">xl</span>
				<Avatar name="Alex" size="xl" />
				<Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" name="Alex" size="xl" />
			</div>
		</div>
	{/snippet}
</Story>
