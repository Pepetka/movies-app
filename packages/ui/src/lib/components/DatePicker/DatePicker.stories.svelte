<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import type { DatePickerSize } from './DatePicker.types.svelte';
	import DatePicker from './DatePicker.svelte';
	import { Button } from '../Button';

	const { Story } = defineMeta({
		title: 'Components/DatePicker',
		component: DatePicker,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] as DatePickerSize[] }
		}
	});

	let selectedDate = $state<Date | null>(null);
	let checkInDate = $state<Date | null>(null);
	let checkOutDate = $state<Date | null>(null);
</script>

<Story name="Playground" args={{ label: 'Дата', placeholder: 'Выберите дату', size: 'md' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>sm</span
				>
				<div style="max-width: 300px;">
					<DatePicker size="sm" label="Дата" />
				</div>
			</div>
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>md</span
				>
				<div style="max-width: 300px;">
					<DatePicker size="md" label="Дата" />
				</div>
			</div>
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>lg</span
				>
				<div style="max-width: 300px;">
					<DatePicker size="lg" label="Дата" />
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="All States">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 300px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Default with placeholder</span
				>
				<DatePicker label="Выберите дату" placeholder="дд.мм.гггг" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>With value</span
				>
				<DatePicker label="Дата рождения" value={new Date(1990, 5, 15)} />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Disabled</span
				>
				<DatePicker label="Дата" value={new Date()} disabled />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Error</span
				>
				<DatePicker label="Дата" errorMessage="Дата обязательна" error />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>With helper</span
				>
				<DatePicker label="Дата доставки" helper="Выберите удобную дату доставки" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Clearable">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 300px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>С возможностью очистки (hover или открытое состояние)</span
				>
				<DatePicker label="Дата" clearable value={new Date()} />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Без очистки (по умолчанию)</span
				>
				<DatePicker label="Дата" value={new Date()} />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Constraints">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 300px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Min/Max dates</span
				>
				<DatePicker
					label="Дата записи"
					minDate={new Date()}
					maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
					helper="Выберите дату в ближайшие 30 дней"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Disabled Dates">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 300px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Weekends disabled</span
				>
				<DatePicker
					label="Рабочий день"
					disabledDaysOfWeek={[0, 6]}
					helper="Выберите будний день"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div
			style="max-width: 400px; padding: 32px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: 24px; color: var(--text-primary);">Бронирование отеля</h2>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<DatePicker
					bind:value={checkInDate}
					label="Заезд"
					minDate={new Date()}
					helper="Дата заезда"
				/>
				<DatePicker
					bind:value={checkOutDate}
					label="Выезд"
					minDate={checkInDate ?? new Date()}
					helper="Дата выезда"
				/>
				<Button type="submit" variant="primary" style="margin-top: 8px;">Забронировать</Button>
			</form>
		</div>
	{/snippet}
</Story>

<Story name="Interactive">
	{#snippet template()}
		<div style="max-width: 300px;">
			<DatePicker
				bind:value={selectedDate}
				label="Выберите дату"
				clearable
				helper="Нажмите для выбора даты"
			/>
			{#if selectedDate}
				<p style="margin-top: 16px; font-size: var(--text-sm); color: var(--text-secondary);">
					Выбрано: {selectedDate.toLocaleDateString('ru-RU', {
						weekday: 'long',
						day: 'numeric',
						month: 'long',
						year: 'numeric'
					})}
				</p>
			{/if}
		</div>
	{/snippet}
</Story>

<Story name="Locales">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 300px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Russian (ru-RU)</span
				>
				<DatePicker label="Дата" locale="ru-RU" value={new Date()} />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>English (en-US)</span
				>
				<DatePicker label="Date" locale="en-US" value={new Date()} />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>German (de-DE)</span
				>
				<DatePicker label="Datum" locale="de-DE" value={new Date()} />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Not Clearable">
	{#snippet template()}
		<div style="max-width: 300px;">
			<DatePicker
				bind:value={selectedDate}
				label="Дата рождения"
				clearable={false}
				helper="Поле без возможности очистки"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="max-width: 400px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>
			<DatePicker label="Выберите дату" helper="Откройте календарь и используйте клавиши ниже" />

			<div
				style="margin-top: 24px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Доступные клавиши:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Enter / Space</kbd
						>
						<span style="color: var(--text-secondary);"
							>Открыть/закрыть календарь, выбрать дату</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Escape</kbd
						>
						<span style="color: var(--text-secondary);">Закрыть календарь</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>ArrowLeft / ArrowRight</kbd
						>
						<span style="color: var(--text-secondary);">Предыдущий/следующий день</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>ArrowUp / ArrowDown</kbd
						>
						<span style="color: var(--text-secondary);">Предыдущая/следующая неделя</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>PageUp / PageDown</kbd
						>
						<span style="color: var(--text-secondary);">Предыдущий/следующий месяц</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Home</kbd
						>
						<span style="color: var(--text-secondary);">Первый день месяца</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>End</kbd
						>
						<span style="color: var(--text-secondary);">Последний день месяца</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
