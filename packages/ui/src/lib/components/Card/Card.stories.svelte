<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Film, Users } from '@lucide/svelte';

	import { Avatar } from '../Avatar';
	import { Switch } from '../Switch';
	import Card from './Card.svelte';

	const { Story } = defineMeta({
		title: 'Components/Card',
		component: Card,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: 'select', options: ['elevated', 'outlined', 'filled'] },
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			interactive: { control: 'boolean' },
			fullWidth: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'elevated', size: 'md', interactive: false }}>
	<h3 style="margin: 0 0 8px 0;">Card Title</h3>
	<p style="margin: 0; color: var(--text-secondary);">
		Card content goes here. This is the default elevated variant.
	</p>
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: flex-start;">
			<Card variant="elevated" size="sm">
				<h4 style="margin: 0 0 4px 0; font-size: var(--text-sm);">Small</h4>
				<p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">
					12px padding
				</p>
			</Card>

			<Card variant="elevated" size="md">
				<h4 style="margin: 0 0 8px 0;">Medium</h4>
				<p style="margin: 0; color: var(--text-secondary);">16px padding (default)</p>
			</Card>

			<Card variant="elevated" size="lg">
				<h4 style="margin: 0 0 12px 0;">Large</h4>
				<p style="margin: 0; color: var(--text-secondary);">24px padding</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Elevated">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
			<Card variant="elevated" size="sm">
				<h4 style="margin: 0 0 4px 0; font-size: var(--text-sm);">Small Elevated</h4>
				<p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">
					Compact card with shadow
				</p>
			</Card>

			<Card variant="elevated" size="md">
				<h3 style="margin: 0 0 8px 0;">Medium Elevated</h3>
				<p style="margin: 0; color: var(--text-secondary);">Standard card with medium shadow</p>
			</Card>

			<Card variant="elevated" size="lg">
				<h3 style="margin: 0 0 12px 0;">Large Elevated</h3>
				<p style="margin: 0; color: var(--text-secondary);">Featured card with prominent shadow</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Outlined">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
			<Card variant="outlined" size="sm">
				<h4 style="margin: 0 0 4px 0; font-size: var(--text-sm);">Small Outlined</h4>
				<p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">
					Compact bordered card
				</p>
			</Card>

			<Card variant="outlined" size="md">
				<h3 style="margin: 0 0 8px 0;">Medium Outlined</h3>
				<p style="margin: 0; color: var(--text-secondary);">Standard bordered card</p>
			</Card>

			<Card variant="outlined" size="lg">
				<h3 style="margin: 0 0 12px 0;">Large Outlined</h3>
				<p style="margin: 0; color: var(--text-secondary);">Large bordered card</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Filled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
			<Card variant="filled" size="sm">
				<h4 style="margin: 0 0 4px 0; font-size: var(--text-sm);">Small Filled</h4>
				<p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">
					Compact card with background
				</p>
			</Card>

			<Card variant="filled" size="md">
				<h3 style="margin: 0 0 8px 0;">Medium Filled</h3>
				<p style="margin: 0; color: var(--text-secondary);">Standard card with background</p>
			</Card>

			<Card variant="filled" size="lg">
				<h3 style="margin: 0 0 12px 0;">Large Filled</h3>
				<p style="margin: 0; color: var(--text-secondary);">Large card with background</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Interactive">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
			<Card variant="elevated" size="md" interactive onclick={() => alert('Elevated clicked!')}>
				<h3 style="margin: 0 0 8px 0;">Elevated Card</h3>
				<p style="margin: 0; color: var(--text-secondary);">Click me - interactive with shadow</p>
			</Card>

			<Card variant="outlined" size="md" interactive onclick={() => alert('Outlined clicked!')}>
				<h3 style="margin: 0 0 8px 0;">Outlined Card</h3>
				<p style="margin: 0; color: var(--text-secondary);">Click me - interactive with border</p>
			</Card>

			<Card variant="filled" size="md" interactive onclick={() => alert('Filled clicked!')}>
				<h3 style="margin: 0 0 8px 0;">Filled Card</h3>
				<p style="margin: 0; color: var(--text-secondary);">
					Click me - interactive with background
				</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Full Width">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<Card variant="elevated" size="md" fullWidth>
				<h3 style="margin: 0 0 8px 0;">Full Width Elevated</h3>
				<p style="margin: 0; color: var(--text-secondary);">
					This card takes full width of container
				</p>
			</Card>

			<Card variant="outlined" size="md" fullWidth>
				<h3 style="margin: 0 0 8px 0;">Full Width Outlined</h3>
				<p style="margin: 0; color: var(--text-secondary);">Bordered full width card</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">Movie Card</h3>
			<Card variant="elevated" size="md" interactive>
				<div style="display: flex; gap: 16px;">
					<div
						style="display: flex; align-items: center; justify-content: center; width: 80px; height: 120px; background: var(--bg-tertiary); border-radius: var(--radius-lg); flex-shrink: 0;"
					>
						<Film size={32} style="color: var(--text-tertiary);" />
					</div>
					<div style="flex: 1; min-width: 0;">
						<h4 style="margin: 0 0 4px 0;">The Matrix</h4>
						<p style="margin: 0 0 8px 0; font-size: var(--text-sm); color: var(--text-secondary);">
							1999 • Action, Sci-Fi
						</p>
						<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
							A computer hacker learns about the true nature of reality and his role in the war
							against its controllers.
						</p>
					</div>
				</div>
			</Card>

			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">Group Card</h3>
			<Card variant="outlined" size="md" interactive>
				<div style="display: flex; gap: 12px; align-items: center;">
					<Avatar name="Movie Night Club" size="md" />
					<div style="flex: 1; min-width: 0;">
						<h4 style="margin: 0 0 4px 0;">Movie Night Club</h4>
						<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
							12 members • 48 movies
						</p>
					</div>
				</div>
			</Card>

			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">Settings Panel</h3>
			<Card variant="filled" size="lg">
				<h3 style="margin: 0 0 16px 0;">Account Settings</h3>
				<div style="display: flex; flex-direction: column; gap: 12px;">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<div>
							<div style="font-weight: var(--font-medium);">Email Notifications</div>
							<div style="font-size: var(--text-sm); color: var(--text-secondary);">
								Receive email updates about your activity
							</div>
						</div>
						<Switch checked={true} label="Email notifications" />
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<div>
							<div style="font-weight: var(--font-medium);">Public Profile</div>
							<div style="font-size: var(--text-sm); color: var(--text-secondary);">
								Allow others to see your profile
							</div>
						</div>
						<Switch checked={false} label="Public profile" />
					</div>
				</div>
			</Card>

			<h3 style="margin: 0 0 16px 0; color: var(--text-secondary);">User Stats</h3>
			<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
				<Card variant="elevated" size="sm" fullWidth>
					<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
						<Film size={16} style="color: var(--text-secondary);" />
						<div>
							<div style="font-size: var(--text-xl); font-weight: var(--font-bold);">127</div>
							<div style="font-size: var(--text-xs); color: var(--text-secondary);">Movies</div>
						</div>
					</div>
				</Card>
				<Card variant="elevated" size="sm" fullWidth>
					<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
						<Users size={16} style="color: var(--text-secondary);" />
						<div>
							<div style="font-size: var(--text-xl); font-weight: var(--font-bold);">8</div>
							<div style="font-size: var(--text-xs); color: var(--text-secondary);">Groups</div>
						</div>
					</div>
				</Card>
				<Card variant="elevated" size="sm" fullWidth>
					<div style="text-align: center;">
						<div style="font-size: var(--text-xl); font-weight: var(--font-bold);">342</div>
						<div style="font-size: var(--text-xs); color: var(--text-secondary);">Reviews</div>
					</div>
				</Card>
			</div>
		</div>
	{/snippet}
</Story>
