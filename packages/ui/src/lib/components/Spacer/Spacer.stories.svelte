<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { SpacerSize } from './Spacer.types.svelte';
	import Checkbox from '../Checkbox/Checkbox.svelte';
	import Button from '../Button/Button.svelte';
	import Input from '../Input/Input.svelte';
	import Card from '../Card/Card.svelte';
	import Spacer from './Spacer.svelte';

	const { Story } = defineMeta({
		title: 'Components/Spacer',
		component: Spacer,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: 'select',
				options: ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'] as SpacerSize[]
			}
		}
	});
</script>

<Story name="Playground" args={{ size: '4' }}>
	{#snippet template(args)}
		<Card variant="elevated" size="md" style="max-width: 400px;">
			<h3 style="margin: 0 0 16px 0;">Spacer Playground</h3>
			<div style="display: flex; flex-direction: column;">
				<div
					style="padding: 12px; background-color: var(--bg-secondary); border-radius: var(--radius-md); text-align: center;"
				>
					Element 1
				</div>
				<Spacer {...args} />
				<div
					style="padding: 12px; background-color: var(--bg-secondary); border-radius: var(--radius-md); text-align: center;"
				>
					Element 2
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<Card variant="outlined" style="max-width: 500px;">
			<div style="display: flex; flex-direction: column;">
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 1 (4px)</span>
				</div>
				<Spacer size="1" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 2 (8px)</span>
				</div>
				<Spacer size="2" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 3 (12px)</span>
				</div>
				<Spacer size="3" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 4 (16px)</span>
				</div>
				<Spacer size="4" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 5 (20px)</span>
				</div>
				<Spacer size="5" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 6 (24px)</span>
				</div>
				<Spacer size="6" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 8 (32px)</span>
				</div>
				<Spacer size="8" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 10 (40px)</span>
				</div>
				<Spacer size="10" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 12 (48px)</span>
				</div>
				<Spacer size="12" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 16 (64px)</span>
				</div>
				<Spacer size="16" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 20 (80px)</span>
				</div>
				<Spacer size="20" />
				<div
					style="display: flex; align-items: center; padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
				>
					<span style="font-family: monospace; font-size: var(--text-sm);">Space 24 (96px)</span>
				</div>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Form">
	{#snippet template()}
		<Card variant="elevated" style="max-width: 400px;">
			<h3 style="margin: 0 0 16px 0;">Form Example</h3>
			<div style="display: flex; flex-direction: column;">
				<Input label="Email" type="email" placeholder="your@email.com" />
				<Spacer size="3" />
				<Input label="Password" type="password" placeholder="••••••••" />
				<Spacer size="4" />
				<Button style="width: 100%;">Sign In</Button>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Buttons">
	{#snippet template()}
		<Card variant="elevated" size="md">
			<h3 style="margin: 0 0 16px 0;">Button Actions</h3>
			<div style="display: flex; flex-wrap: wrap; gap: 8px;">
				<Button>Primary</Button>
				<Spacer size="2" />
				<Button variant="secondary">Secondary</Button>
				<Spacer size="2" />
				<Button variant="ghost">Cancel</Button>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Sections">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; max-width: 400px;">
			<section>
				<h3 style="margin: 0 0 8px 0;">Header Section</h3>
				<p style="margin: 0; color: var(--text-secondary);">
					Main heading and description goes here.
				</p>
			</section>
			<Spacer size="6" />
			<section>
				<h3 style="margin: 0 0 8px 0;">Content Section</h3>
				<p style="margin: 0; color: var(--text-secondary);">
					Main content with detailed information.
				</p>
			</section>
			<Spacer size="8" />
			<section>
				<h3 style="margin: 0 0 8px 0;">Footer Section</h3>
				<p style="margin: 0; color: var(--text-secondary);">Additional links and information.</p>
			</section>
		</div>
	{/snippet}
</Story>

<Story name="In Context - List Items">
	{#snippet template()}
		<Card variant="elevated" style="max-width: 400px;">
			<h3 style="margin: 0 0 16px 0;">Task List</h3>
			<div style="display: flex; flex-direction: column;">
				<div style="display: flex; align-items: center; gap: 12px;">
					<Checkbox checked label="Task 1" />
					<span style="width: 100px; text-decoration: line-through; color: var(--text-tertiary);"
						>Complete</span
					>
				</div>
				<Spacer size="2" />
				<div style="display: flex; align-items: center; gap: 12px;">
					<Checkbox checked label="Task 2" />
					<span style="width: 100px; text-decoration: line-through; color: var(--text-tertiary);"
						>Complete</span
					>
				</div>
				<Spacer size="2" />
				<div style="display: flex; align-items: center; gap: 12px;">
					<Checkbox label="Task 3" />
					<div style="width: 100px;">Pending</div>
				</div>
				<Spacer size="3" />
				<Button variant="secondary" size="sm">Add Task</Button>
			</div>
		</Card>
	{/snippet}
</Story>

<Story name="In Context - Card Stack">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; max-width: 400px;">
			<Card variant="elevated">
				<h3 style="margin: 0 0 8px 0;">Card 1</h3>
				<p style="margin: 0; color: var(--text-secondary);">First card with some content.</p>
			</Card>
			<Spacer size="4" />
			<Card variant="elevated">
				<h3 style="margin: 0 0 8px 0;">Card 2</h3>
				<p style="margin: 0; color: var(--text-secondary);">Second card with different content.</p>
			</Card>
			<Spacer size="4" />
			<Card variant="elevated">
				<h3 style="margin: 0 0 8px 0;">Card 3</h3>
				<p style="margin: 0; color: var(--text-secondary);">Third card with more content.</p>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Comparison With Margin">
	{#snippet template()}
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
			<div>
				<h4 style="margin-bottom: 12px; color: var(--text-secondary);">Using Spacer</h4>
				<Card variant="elevated" size="md">
					<div style="display: flex; flex-direction: column;">
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
						>
							Item 1
						</div>
						<Spacer size="2" />
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
						>
							Item 2
						</div>
						<Spacer size="3" />
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
						>
							Item 3
						</div>
						<Spacer size="4" />
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
						>
							Item 4
						</div>
					</div>
				</Card>
			</div>
			<div>
				<h4 style="margin-bottom: 12px; color: var(--text-secondary);">Using margin-bottom</h4>
				<Card variant="elevated" size="md">
					<div style="display: flex; flex-direction: column;">
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm); margin-bottom: var(--space-2);"
						>
							Item 1
						</div>
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm); margin-bottom: var(--space-3);"
						>
							Item 2
						</div>
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm); margin-bottom: var(--space-4);"
						>
							Item 3
						</div>
						<div
							style="padding: 8px 12px; background-color: var(--bg-secondary); border-radius: var(--radius-sm);"
						>
							Item 4
						</div>
					</div>
				</Card>
			</div>
		</div>
	{/snippet}
</Story>
