<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { SpinnerSize, SpinnerVariant } from './Spinner.types.svelte';
	import Button from '../Button/Button.svelte';
	import Spinner from './Spinner.svelte';
	import Card from '../Card/Card.svelte';

	const { Story } = defineMeta({
		title: 'Components/Spinner',
		component: Spinner,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] as SpinnerSize[] },
			variant: { control: 'select', options: ['default', 'light', 'inherit'] as SpinnerVariant[] }
		}
	});
</script>

<Story name="Playground" args={{ size: 'md', variant: 'default', label: 'Loading' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; gap: 24px; align-items: center;">
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Spinner size="sm" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">sm</span>
			</div>
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Spinner size="md" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">md</span>
			</div>
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Spinner size="lg" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">lg</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; gap: 24px; align-items: center;">
			<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
				<Spinner variant="default" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">default</span>
			</div>
			<div
				style="display: flex; flex-direction: column; align-items: center; gap: 8px; background: var(--color-primary); padding: 16px; border-radius: var(--radius-lg);"
			>
				<Spinner variant="light" />
				<span style="font-size: var(--text-sm); color: var(--text-inverse);">light</span>
			</div>
			<div
				style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--color-error);"
			>
				<Spinner variant="inherit" />
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">inherit</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<Card variant="outlined" size="sm">
				<div style="display: flex; align-items: center; gap: 12px;">
					<Spinner size="sm" />
					<span style="color: var(--text-secondary);">Loading data...</span>
				</div>
			</Card>

			<Card variant="outlined">
				<div style="display: flex; justify-content: center; align-items: center; height: 200px;">
					<div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
						<Spinner size="lg" />
						<span style="color: var(--text-tertiary);">Fetching content...</span>
					</div>
				</div>
			</Card>

			<div style="display: flex; gap: 8px;">
				<Button loading>Processing</Button>
				<Button variant="secondary" loading>Loading</Button>
				<Button variant="danger" loading>Deleting</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Sizes Comparison">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">sm</span>
				<Spinner size="sm" />
				<span style="font-size: var(--text-sm);">16px - buttons, inline</span>
			</div>
			<div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">md</span>
				<Spinner size="md" />
				<span style="font-size: var(--text-sm);">24px - default</span>
			</div>
			<div style="display: flex; gap: 16px; align-items: center;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); width: 40px;">lg</span>
				<Spinner size="lg" />
				<span style="font-size: var(--text-sm);">32px - containers</span>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Button Loading States">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="display: flex; gap: 8px; align-items: center;">
				<Button size="sm" loading>Small</Button>
				<Button size="md" loading>Medium</Button>
				<Button size="lg" loading>Large</Button>
			</div>
			<div style="display: flex; gap: 8px; align-items: center;">
				<Button variant="primary" loading>Primary</Button>
				<Button variant="secondary" loading>Secondary</Button>
				<Button variant="ghost" loading>Ghost</Button>
				<Button variant="danger" loading>Danger</Button>
			</div>
		</div>
	{/snippet}
</Story>
