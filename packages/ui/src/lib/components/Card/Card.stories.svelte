<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Mail, Lock, Film, Users } from '@lucide/svelte';

	import { Avatar } from '../Avatar';
	import { Button } from '../Button';
	import { Switch } from '../Switch';
	import { Input } from '../Input';
	import Card from './Card.svelte';

	const { Story } = defineMeta({
		title: 'Components/Card',
		component: Card,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: 'select', options: ['elevated', 'outlined', 'filled'] },
			size: { control: 'select', options: ['sm', 'md', 'lg', 'responsive'] },
			interactive: { control: 'boolean' },
			fullWidth: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'elevated', size: 'md', interactive: false }}>
	<h3 style="margin: 0 0 var(--space-2);">Card Title</h3>
	<p style="margin: 0; color: var(--text-secondary);">
		Card content goes here. This is the default elevated variant.
	</p>
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; gap: var(--space-4); align-items: flex-start;">
			<Card variant="elevated" size="sm">
				<h4 style="margin: 0 0 var(--space-1); font-size: var(--text-sm);">Small</h4>
				<p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">
					Compact padding
				</p>
			</Card>

			<Card variant="elevated" size="md">
				<h4 style="margin: 0 0 var(--space-2);">Medium</h4>
				<p style="margin: 0; color: var(--text-secondary);">Default padding</p>
			</Card>

			<Card variant="elevated" size="lg">
				<h4 style="margin: 0 0 var(--space-3);">Large</h4>
				<p style="margin: 0; color: var(--text-secondary);">Spacious padding</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Responsive Size">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 400px;">
			<Card variant="outlined" size="responsive">
				{#snippet header()}
					<div style="text-align: center;">
						<h4 style="margin: 0 0 var(--space-1);">Responsive Card</h4>
						<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
							Измените ширину окна для просмотра
						</p>
					</div>
				{/snippet}

				<p style="margin: 0; color: var(--text-secondary);">
					<code>size="responsive"</code> — sm на экранах &lt; 480px, md на больших экранах. Идеально для
					auth-форм.
				</p>

				{#snippet footer()}
					<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
						Footer адаптируется вместе с карточкой
					</p>
				{/snippet}
			</Card>

			<Card variant="elevated" size="responsive">
				<div style="display: flex; flex-direction: column; gap: var(--space-2);">
					<p style="margin: 0; color: var(--text-secondary);">
						Простая карточка без секций — только body.
					</p>
					<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
						Padding автоматически уменьшается на мобильных устройствах.
					</p>
				</div>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 400px;">
			<Card variant="elevated" size="md">
				<h4 style="margin: 0 0 var(--space-2);">Elevated</h4>
				<p style="margin: 0; color: var(--text-secondary);">
					Card with shadow for visual hierarchy
				</p>
			</Card>

			<Card variant="outlined" size="md">
				<h4 style="margin: 0 0 var(--space-2);">Outlined</h4>
				<p style="margin: 0; color: var(--text-secondary);">
					Card with border for subtle separation
				</p>
			</Card>

			<Card variant="filled" size="md">
				<h4 style="margin: 0 0 var(--space-2);">Filled</h4>
				<p style="margin: 0; color: var(--text-secondary);">
					Card with background for grouped content
				</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Interactive">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 400px;">
			<Card variant="elevated" size="md" interactive onclick={() => alert('Elevated clicked!')}>
				<h4 style="margin: 0 0 var(--space-2);">Elevated Card</h4>
				<p style="margin: 0; color: var(--text-secondary);">Click me - interactive with shadow</p>
			</Card>

			<Card variant="outlined" size="md" interactive onclick={() => alert('Outlined clicked!')}>
				<h4 style="margin: 0 0 var(--space-2);">Outlined Card</h4>
				<p style="margin: 0; color: var(--text-secondary);">Click me - interactive with border</p>
			</Card>

			<Card variant="filled" size="md" interactive onclick={() => alert('Filled clicked!')}>
				<h4 style="margin: 0 0 var(--space-2);">Filled Card</h4>
				<p style="margin: 0; color: var(--text-secondary);">
					Click me - interactive with background
				</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Full Width">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-4);">
			<Card variant="elevated" size="md" fullWidth>
				<h4 style="margin: 0 0 var(--space-2);">Full Width Elevated</h4>
				<p style="margin: 0; color: var(--text-secondary);">
					This card takes full width of container
				</p>
			</Card>

			<Card variant="outlined" size="md" fullWidth>
				<h4 style="margin: 0 0 var(--space-2);">Full Width Outlined</h4>
				<p style="margin: 0; color: var(--text-secondary);">Bordered full width card</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="With Sections">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 400px;">
			<Card variant="outlined" size="md">
				{#snippet header()}
					<div style="text-align: center;">
						<h4 style="margin: 0 0 var(--space-1);">Card Header</h4>
						<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
							Header description
						</p>
					</div>
				{/snippet}

				<p style="margin: 0; color: var(--text-secondary);">
					This card uses named snippets for header, body, and footer sections.
				</p>

				{#snippet footer()}
					<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
						Card footer content
					</p>
				{/snippet}
			</Card>

			<Card variant="elevated" size="lg">
				{#snippet header()}
					<div style="text-align: center;">
						<h4 style="margin: 0 0 var(--space-1);">Large Card</h4>
						<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
							With all sections
						</p>
					</div>
				{/snippet}

				<div style="display: flex; flex-direction: column; gap: var(--space-2);">
					<p style="margin: 0; color: var(--text-secondary);">
						Body content can contain any elements you need.
					</p>
					<p style="margin: 0; color: var(--text-secondary);">
						Size prop affects padding of all sections.
					</p>
				</div>

				{#snippet footer()}
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span style="font-size: var(--text-sm); color: var(--text-tertiary);">Footer left</span>
						<span style="font-size: var(--text-sm); color: var(--text-tertiary);">Footer right</span
						>
					</div>
				{/snippet}
			</Card>

			<Card variant="outlined" size="md" interactive onclick={() => alert('Card clicked!')}>
				{#snippet header()}
					<div style="text-align: center;">
						<h4 style="margin: 0 0 var(--space-1);">Interactive Card</h4>
						<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
							Click anywhere on the card
						</p>
					</div>
				{/snippet}

				<p style="margin: 0; color: var(--text-secondary);">
					Interactive cards work with sections too. The entire card is clickable.
				</p>

				{#snippet footer()}
					<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
						Press Enter or Space to activate
					</p>
				{/snippet}
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-6); max-width: 600px;">
			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Movie Card</h4>
				<Card variant="elevated" size="md" interactive>
					<div style="display: flex; gap: var(--space-4);">
						<div
							style="display: flex; align-items: center; justify-content: center; width: 80px; height: 120px; background: var(--bg-tertiary); border-radius: var(--radius-lg); flex-shrink: 0;"
						>
							<Film size={32} style="color: var(--text-tertiary);" />
						</div>
						<div style="flex: 1; min-width: 0;">
							<h4 style="margin: 0 0 var(--space-1);">The Matrix</h4>
							<p
								style="margin: 0 0 var(--space-2); font-size: var(--text-sm); color: var(--text-secondary);"
							>
								1999 • Action, Sci-Fi
							</p>
							<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
								A computer hacker learns about the true nature of reality and his role in the war
								against its controllers.
							</p>
						</div>
					</div>
				</Card>
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Group Card</h4>
				<Card variant="outlined" size="md" interactive>
					<div style="display: flex; gap: var(--space-3); align-items: center;">
						<Avatar name="Movie Night Club" size="md" />
						<div style="flex: 1; min-width: 0;">
							<h4 style="margin: 0 0 var(--space-1);">Movie Night Club</h4>
							<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
								12 members • 48 movies
							</p>
						</div>
					</div>
				</Card>
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Settings Panel</h4>
				<Card variant="filled" size="lg">
					<h4 style="margin: 0 0 var(--space-4);">Account Settings</h4>
					<div style="display: flex; flex-direction: column; gap: var(--space-3);">
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
			</div>

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">User Stats</h4>
				<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);">
					<Card variant="elevated" size="sm" fullWidth>
						<div
							style="display: flex; align-items: center; justify-content: center; gap: var(--space-2);"
						>
							<Film size={16} style="color: var(--text-secondary);" />
							<div>
								<div style="font-size: var(--text-xl); font-weight: var(--font-bold);">127</div>
								<div style="font-size: var(--text-xs); color: var(--text-secondary);">Movies</div>
							</div>
						</div>
					</Card>
					<Card variant="elevated" size="sm" fullWidth>
						<div
							style="display: flex; align-items: center; justify-content: center; gap: var(--space-2);"
						>
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

			<div>
				<h4 style="margin: 0 0 var(--space-3); color: var(--text-secondary);">Auth Form</h4>
				<div style="display: flex; justify-content: center;">
					<div style="width: 100%; max-width: 400px;">
						<Card variant="outlined" size="md">
							{#snippet header()}
								<div style="text-align: center;">
									<h3
										style="margin: 0 0 var(--space-1); font-size: var(--text-lg); font-weight: var(--font-semibold);"
									>
										Welcome Back
									</h3>
									<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
										Sign in to your account
									</p>
								</div>
							{/snippet}

							<div style="display: flex; flex-direction: column; gap: var(--space-1);">
								<Input type="email" label="Email" placeholder="your@email.com" Icon={Mail} />
								<Input type="password" label="Password" placeholder="••••••••" Icon={Lock} />
								<Button type="button" variant="primary" fullWidth>Sign In</Button>
							</div>

							{#snippet footer()}
								<p style="margin: 0; font-size: var(--text-sm); color: var(--text-tertiary);">
									Don't have an account? <a
										href="/signup"
										style="color: var(--color-primary); text-decoration: none; font-weight: var(--font-semibold);"
										onclick={(e) => e.preventDefault()}>Sign up</a
									>
								</p>
							{/snippet}
						</Card>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
