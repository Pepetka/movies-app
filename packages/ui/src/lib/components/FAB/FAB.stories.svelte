<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Plus } from '@lucide/svelte';

	import FAB from './FAB.svelte';

	const { Story } = defineMeta({
		title: 'Components/FAB',
		component: FAB,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] },
			position: { control: 'select', options: ['bottom-right', 'bottom-left', 'bottom-center'] }
		}
	});
</script>

<Story name="Playground" args={{ size: 'md', position: 'bottom-right' }}>
	{#snippet template(args)}
		<div style="position: relative; min-height: 200px;">
			<FAB {...args}>
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div style="position: relative; min-height: 300px;">
			<p style="margin-bottom: 24px; color: var(--text-secondary);">
				FAB components shown in different positions for Storybook preview
			</p>
			<div style="padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<div style="margin-bottom: 16px; font-size: var(--text-sm); color: var(--text-tertiary);">
					MD (56px) - bottom-right
				</div>
				<div style="margin-bottom: 24px; font-size: var(--text-sm); color: var(--text-tertiary);">
					SM (40px) - bottom-left
				</div>
				<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
					LG (extended) - bottom-center
				</div>
			</div>
			<FAB size="md" position="bottom-right">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
			<FAB size="sm" position="bottom-left">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
			<FAB size="lg" label="Create New" position="bottom-center">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="MD (Default)">
	{#snippet template()}
		<div
			style="position: relative; min-height: 200px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<p style="color: var(--text-secondary);">Standard FAB (56x56)</p>
			<FAB size="md" position="bottom-right">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="SM (Mini)">
	{#snippet template()}
		<div
			style="position: relative; min-height: 200px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<p style="color: var(--text-secondary);">Compact FAB (40x40)</p>
			<FAB size="sm" position="bottom-right">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="LG (Extended)">
	{#snippet template()}
		<div
			style="position: relative; min-height: 200px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<p style="color: var(--text-secondary);">Extended FAB with label</p>
			<FAB size="lg" label="Add Movie" position="bottom-right">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="Positions">
	{#snippet template()}
		<div
			style="position: relative; min-height: 300px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<p style="color: var(--text-secondary);">Different positioning options</p>
			<div style="margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap;">
				<div>
					<span style="font-size: var(--text-sm); color: var(--text-tertiary);">Bottom Right</span>
					<FAB position="bottom-right">
						{#snippet icon()}
							<Plus />
						{/snippet}
					</FAB>
				</div>
				<div>
					<span style="font-size: var(--text-sm); color: var(--text-tertiary);">Bottom Left</span>
					<FAB position="bottom-left">
						{#snippet icon()}
							<Plus />
						{/snippet}
					</FAB>
				</div>
				<div>
					<span style="font-size: var(--text-sm); color: var(--text-tertiary);">Bottom Center</span>
					<FAB position="bottom-center">
						{#snippet icon()}
							<Plus />
						{/snippet}
					</FAB>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div style="position: relative; min-height: 400px;">
			<div
				style="max-width: 400px; margin: 0 auto; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h2
					style="margin-bottom: 16px; font-size: var(--text-xl); font-weight: var(--font-semibold);"
				>
					Movies List
				</h2>
				<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
					<div
						style="padding: 16px; background: var(--bg-primary); border-radius: var(--radius-lg);"
					>
						<div style="font-weight: var(--font-medium);">The Shawshank Redemption</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">1994 • Drama</div>
					</div>
					<div
						style="padding: 16px; background: var(--bg-primary); border-radius: var(--radius-lg);"
					>
						<div style="font-weight: var(--font-medium);">The Godfather</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">1972 • Crime</div>
					</div>
					<div
						style="padding: 16px; background: var(--bg-primary); border-radius: var(--radius-lg);"
					>
						<div style="font-weight: var(--font-medium);">The Dark Knight</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">2008 • Action</div>
					</div>
				</div>
			</div>
			<FAB position="bottom-right">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="Extended In Context">
	{#snippet template()}
		<div style="position: relative; min-height: 400px;">
			<div
				style="max-width: 400px; margin: 0 auto; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h2
					style="margin-bottom: 16px; font-size: var(--text-xl); font-weight: var(--font-semibold);"
				>
					Groups
				</h2>
				<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
					<div
						style="padding: 16px; background: var(--bg-primary); border-radius: var(--radius-lg);"
					>
						<div style="font-weight: var(--font-medium);">Movie Night Crew</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">5 members</div>
					</div>
					<div
						style="padding: 16px; background: var(--bg-primary); border-radius: var(--radius-lg);"
					>
						<div style="font-weight: var(--font-medium);">Family Movies</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">3 members</div>
					</div>
				</div>
			</div>
			<FAB size="lg" label="Create Group" position="bottom-right">
				{#snippet icon()}
					<Plus />
				{/snippet}
			</FAB>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div
			style="position: relative; min-height: 200px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
		>
			<p style="color: var(--text-secondary); margin-bottom: 16px;">Disabled FAB states</p>
			<div style="display: flex; gap: 16px; flex-wrap: wrap;">
				<div>
					<span style="font-size: var(--text-sm); color: var(--text-tertiary);">SM Disabled</span>
					<FAB size="sm" position="bottom-left" disabled>
						{#snippet icon()}
							<Plus />
						{/snippet}
					</FAB>
				</div>
				<div>
					<span style="font-size: var(--text-sm); color: var(--text-tertiary);">MD Disabled</span>
					<FAB size="md" position="bottom-right" disabled>
						{#snippet icon()}
							<Plus />
						{/snippet}
					</FAB>
				</div>
				<div>
					<span style="font-size: var(--text-sm); color: var(--text-tertiary);">LG Disabled</span>
					<FAB size="lg" label="Create" position="bottom-center" disabled>
						{#snippet icon()}
							<Plus />
						{/snippet}
					</FAB>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="position: relative; min-height: 300px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>

			<div style="margin-bottom: 24px;">
				<p style="color: var(--text-secondary); margin-bottom: 16px;">
					FAB — это кнопка, доступная через Tab и активируемая через Enter или Space.
				</p>
				<FAB size="lg" label="Добавить фильм" position="bottom-right">
					{#snippet icon()}
						<Plus />
					{/snippet}
				</FAB>
			</div>

			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Доступные клавиши:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Tab</kbd
						>
						<span style="color: var(--text-secondary);">Фокус на FAB</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Enter / Space</kbd
						>
						<span style="color: var(--text-secondary);">Активация кнопки</span>
					</div>
				</div>
			</div>

			<div
				style="margin-top: 16px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					ARIA атрибуты:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<code style="color: var(--color-primary);">aria-label</code>
						<span style="color: var(--text-secondary);">Описание действия (label или 'Action')</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<code style="color: var(--color-primary);">type="button"</code>
						<span style="color: var(--text-secondary);">Тип кнопки по умолчанию</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
