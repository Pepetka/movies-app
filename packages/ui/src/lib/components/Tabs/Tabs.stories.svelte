<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Tabs from './Tabs.svelte';

	const { Story } = defineMeta({
		title: 'Components/Tabs',
		component: Tabs,
		tags: ['autodocs'],
		argTypes: {
			scrollable: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ scrollable: false }}>
	{#snippet template(args)}
		<Tabs
			{...args}
			tabs={[
				{ id: 'all', label: 'Все' },
				{ id: 'favorites', label: 'Избранное' },
				{ id: 'archived', label: 'Архив' }
			]}
		/>
	{/snippet}
</Story>

<Story name="Basic">
	{#snippet template()}
		<Tabs
			tabs={[
				{ id: 'all', label: 'Все' },
				{ id: 'to-watch', label: 'К просмотру' },
				{ id: 'planned', label: 'План' },
				{ id: 'watched', label: 'Смотрели' }
			]}
		/>
	{/snippet}
</Story>

<Story name="With Counts">
	{#snippet template()}
		<Tabs
			tabs={[
				{ id: 'all', label: 'Все', count: 142 },
				{ id: 'to-watch', label: 'К просмотру', count: 23 },
				{ id: 'planned', label: 'План', count: 8 },
				{ id: 'watched', label: 'Смотрели', count: 111 }
			]}
		/>
	{/snippet}
</Story>

<Story name="Scrollable">
	{#snippet template()}
		<Tabs
			scrollable={true}
			tabs={[
				{ id: 'all', label: 'Все', count: 142 },
				{ id: 'action', label: 'Боевики', count: 25 },
				{ id: 'comedy', label: 'Комедии', count: 33 },
				{ id: 'drama', label: 'Драмы', count: 41 },
				{ id: 'fantasy', label: 'Фэнтези', count: 12 },
				{ id: 'horror', label: 'Ужасы', count: 8 },
				{ id: 'sci-fi', label: 'Sci-Fi', count: 15 },
				{ id: 'thriller', label: 'Триллеры', count: 8 }
			]}
		/>
	{/snippet}
</Story>

<Story name="Controlled">
	{#snippet template()}
		<svelte:component
			this={Tabs}
			tabs={[
				{ id: 'all', label: 'Все' },
				{ id: 'favorites', label: 'Избранное' }
			]}
			value="all"
		/>
	{/snippet}
</Story>

<Story name="Disabled Tabs">
	{#snippet template()}
		<Tabs
			tabs={[
				{ id: 'all', label: 'Все' },
				{ id: 'favorites', label: 'Избранное', disabled: true },
				{ id: 'watched', label: 'Смотрели' },
				{ id: 'archived', label: 'Архив', disabled: true }
			]}
		/>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<div
				style="padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: var(--space-6);"
			>
				<Tabs
					tabs={[
						{ id: 'all', label: 'Все', count: 142 },
						{ id: 'to-watch', label: 'К просмотру', count: 23 },
						{ id: 'planned', label: 'План', count: 8 },
						{ id: 'watched', label: 'Смотрели', count: 111 }
					]}
				/>
				<div style="padding: var(--space-4) 0; color: var(--text-secondary);">
					<p>Контент выбранного таба отображается здесь...</p>
				</div>
			</div>

			<h3 style="margin-bottom: var(--space-3); color: var(--text-secondary);">
				Фильтрация по жанрам
			</h3>
			<div
				style="padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<Tabs
					tabs={[
						{ id: 'action', label: 'Боевики', count: 25 },
						{ id: 'comedy', label: 'Комедии', count: 33 },
						{ id: 'drama', label: 'Драмы', count: 41 },
						{ id: 'fantasy', label: 'Фэнтези', count: 12 }
					]}
				/>
				<div style="padding: var(--space-4) 0; color: var(--text-secondary);">
					<p>Фильмы выбранного жанра...</p>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="All States">
	{#snippet template()}
		<div>
			<div style="margin-bottom: var(--space-6);">
				<p
					style="margin-bottom: var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm);"
				>
					Normal state
				</p>
				<Tabs
					tabs={[
						{ id: 'all', label: 'Все', count: 10 },
						{ id: 'active', label: 'Активные', count: 5 }
					]}
				/>
			</div>

			<div style="margin-bottom: var(--space-6);">
				<p
					style="margin-bottom: var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm);"
				>
					With disabled tabs
				</p>
				<Tabs
					tabs={[
						{ id: 'all', label: 'Все' },
						{ id: 'disabled', label: 'Отключено', disabled: true },
						{ id: 'active', label: 'Активные' }
					]}
				/>
			</div>

			<div>
				<p
					style="margin-bottom: var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm);"
				>
					Without scrollable
				</p>
				<Tabs
					scrollable={false}
					tabs={[
						{ id: 'short1', label: 'Tab 1' },
						{ id: 'short2', label: 'Tab 2' },
						{ id: 'short3', label: 'Tab 3' }
					]}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="max-width: 500px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>

			<Tabs
				tabs={[
					{ id: 'all', label: 'Все', count: 142 },
					{ id: 'favorites', label: 'Избранное', count: 23 },
					{ id: 'watched', label: 'Смотрели', count: 111 }
				]}
			/>

			<div
				style="margin-top: 24px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Доступные клавиши:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Tab</kbd
						>
						<span style="color: var(--text-secondary);">Фокус на активный таб</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>← / →</kbd
						>
						<span style="color: var(--text-secondary);">Перемещение между табами</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Home</kbd
						>
						<span style="color: var(--text-secondary);">Первый таб</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>End</kbd
						>
						<span style="color: var(--text-secondary);">Последний таб</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Enter / Space</kbd
						>
						<span style="color: var(--text-secondary);">Выбор таба</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
