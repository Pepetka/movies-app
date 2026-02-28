<script module lang="ts">
	import { X, Menu, LogOut, User, Bell, Settings, Plus } from '@lucide/svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { StatusIndicator } from '../StatusIndicator';
	import Textarea from '../Textarea/Textarea.svelte';
	import Select from '../Select/Select.svelte';
	import { IconButton } from '../IconButton';
	import Input from '../Input/Input.svelte';
	import { List, ListItem } from '../List';
	import { Button } from '../Button';
	import { Switch } from '../Switch';
	import { Drawer } from './';

	const { Story } = defineMeta({
		title: 'Components/Drawer',
		component: Drawer,
		tags: ['autodocs'],
		argTypes: {
			position: {
				control: 'select',
				options: ['left', 'right', 'bottom']
			},
			size: { control: 'text' },
			closeOnOverlay: { control: 'boolean' },
			closeOnEscape: { control: 'boolean' }
		}
	});

	let drawerOpen = $state(false);
	let leftOpen = $state(false);
	let rightOpen = $state(false);
	let bottomOpen = $state(false);
	let formOpen = $state(false);
	let listOpen = $state(false);
	let sizesOpen = $state(false);
	let strictOpen = $state(false);

	let filterName = $state('');
	let filterCategory = $state('all');
	let taskTitle = $state('');
	let taskDesc = $state('');
	let priority = $state('medium');
	let sorting = $state('date-asc');
	let notificationsEnabled = $state(true);
	let emailNotificationsEnabled = $state(false);
	let soundNotificationsEnabled = $state(true);
</script>

<Story name="Playground">
	{#snippet template(args)}
		<Button onclick={() => (drawerOpen = true)}>Open Drawer</Button>

		<Drawer bind:open={drawerOpen} position="left" {...args}>
			{#snippet header(close)}
				<h2>Навигация</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<p>Это базовый выдвижной drawer.</p>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Закрыть</Button>
			{/snippet}
		</Drawer>
	{/snippet}
</Story>

<Story name="Position Left">
	{#snippet template()}
		<IconButton Icon={Menu} label="Menu" onclick={() => (leftOpen = true)} />

		<Drawer bind:open={leftOpen} position="left" size="280px">
			{#snippet header(close)}
				<h2>Меню</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<List>
				<ListItem>
					<User style="width: 20px;" />
					<span>Профиль</span>
				</ListItem>
				<ListItem>
					<Bell style="width: 20px;" />
					<span>Уведомления</span>
				</ListItem>
				<ListItem>
					<Settings style="width: 20px;" />
					<span>Настройки</span>
				</ListItem>
			</List>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>
					<LogOut style="width: 16px;" />
					Выйти
				</Button>
			{/snippet}
		</Drawer>
	{/snippet}
</Story>

<Story name="Position Right">
	{#snippet template()}
		<Button onclick={() => (rightOpen = true)}>Открыть фильтры</Button>

		<Drawer bind:open={rightOpen} position="right" size="360px">
			{#snippet header(close)}
				<h2>Фильтры</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div style="display: flex; flex-direction: column; gap: var(--space-4);">
				<Input label="Название" placeholder="Поиск по названию" bind:value={filterName} />

				<Select
					label="Категория"
					placeholder="Выберите категорию"
					bind:value={filterCategory}
					options={[
						{ value: 'all', label: 'Все категории' },
						{ value: 'action', label: 'Боевики' },
						{ value: 'comedy', label: 'Комедии' },
						{ value: 'drama', label: 'Драмы' },
						{ value: 'sci-fi', label: 'Фантастика' }
					]}
				/>

				<Select
					label="Сортировка"
					placeholder="Выберите сортировку"
					bind:value={sorting}
					options={[
						{ value: 'date-desc', label: 'По дате (новые)' },
						{ value: 'date-asc', label: 'По дате (старые)' },
						{ value: 'name-asc', label: 'По названию (А-Я)' },
						{ value: 'rating', label: 'По рейтингу' }
					]}
				/>
			</div>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Сбросить</Button>
				<Button
					onclick={() => {
						close();
					}}>Применить</Button
				>
			{/snippet}
		</Drawer>
	{/snippet}
</Story>

<Story name="Position Bottom">
	{#snippet template()}
		<Button onclick={() => (bottomOpen = true)}>Открыть меню действий</Button>

		<Drawer bind:open={bottomOpen} position="bottom">
			<List>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-2);">
						<Plus style="width: 20px;" />
						<span>Создать новый</span>
					</div>
				</ListItem>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-2);">
						<div
							style="width: 20px; height: 20px; background: var(--bg-secondary); border-radius: var(--radius-sm);"
						></div>
						<span>Редактировать</span>
					</div>
				</ListItem>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-2);">
						<div
							style="width: 20px; height: 20px; background: var(--bg-secondary); border-radius: var(--radius-sm);"
						></div>
						<span>Поделиться</span>
					</div>
				</ListItem>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-2);">
						<div
							style="width: 20px; height: 20px; background: var(--bg-secondary); border-radius: var(--radius-sm);"
						></div>
						<span>Дублировать</span>
					</div>
				</ListItem>
			</List>
		</Drawer>
	{/snippet}
</Story>

<Story name="With Form">
	{#snippet template()}
		<Button onclick={() => (formOpen = true)}>Добавить задачу</Button>

		<Drawer bind:open={formOpen} position="right" size="400px">
			{#snippet header(close)}
				<h2>Новая задача</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div style="display: flex; flex-direction: column; gap: var(--space-4);">
				<Input label="Название" placeholder="Введите название задачи" bind:value={taskTitle} />

				<Textarea label="Описание" placeholder="Опишите задачу..." bind:value={taskDesc} rows={4} />

				<Select
					label="Приоритет"
					placeholder="Выберите приоритет"
					bind:value={priority}
					options={[
						{ value: 'low', label: 'Низкий' },
						{ value: 'medium', label: 'Средний' },
						{ value: 'high', label: 'Высокий' }
					]}
				/>
			</div>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Отмена</Button>
				<Button
					onclick={() => {
						close();
					}}>Создать</Button
				>
			{/snippet}
		</Drawer>
	{/snippet}
</Story>

<Story name="With List">
	{#snippet template()}
		<Button onclick={() => (listOpen = true)}>Выбрать статус</Button>

		<Drawer bind:open={listOpen} position="bottom">
			{#snippet header(_close)}
				<h2>Выберите статус</h2>
			{/snippet}

			<List>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-3); flex: 1;">
						<StatusIndicator status="online" />
						<div style="flex: 1;">
							<div style="font-weight: var(--font-medium);">В сети</div>
							<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
								Показывать всем
							</div>
						</div>
					</div>
				</ListItem>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-3); flex: 1;">
						<StatusIndicator status="degraded" />
						<div style="flex: 1;">
							<div style="font-weight: var(--font-medium);">Не беспокоить</div>
							<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
								Отключить уведомления
							</div>
						</div>
					</div>
				</ListItem>
				<ListItem>
					<div style="display: flex; align-items: center; gap: var(--space-3); flex: 1;">
						<StatusIndicator status="offline" />
						<div style="flex: 1;">
							<div style="font-weight: var(--font-medium);">Невидимый</div>
							<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
								Скрыть статус
							</div>
						</div>
					</div>
				</ListItem>
			</List>
		</Drawer>
	{/snippet}
</Story>

<Story name="With Settings">
	{#snippet template()}
		<IconButton Icon={Settings} label="Settings" onclick={() => (rightOpen = true)} />

		<Drawer bind:open={rightOpen} position="right" size="320px">
			{#snippet header(close)}
				<h2>Настройки</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div style="display: flex; flex-direction: column; gap: var(--space-6);">
				<Switch bind:checked={notificationsEnabled} label="Push-уведомления" />

				<Switch bind:checked={emailNotificationsEnabled} label="Email-уведомления" />

				<Switch bind:checked={soundNotificationsEnabled} label="Звуковые уведомления" />
			</div>

			{#snippet footer(close)}
				<Button onclick={close}>Закрыть</Button>
			{/snippet}
		</Drawer>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 24px;">
			<Button onclick={() => (sizesOpen = true)}>Small (240px)</Button>
			<Drawer bind:open={sizesOpen} position="left" size="240px">
				{#snippet header(close)}
					<h2>Small Drawer</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}
				<p>Ширина: <code>240px</code></p>
			</Drawer>

			<Button onclick={() => (leftOpen = true)}>Default (320px)</Button>
			<Drawer bind:open={leftOpen} position="left">
				{#snippet header(close)}
					<h2>Default Drawer</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}
				<p>Ширина: <code>320px</code> (default)</p>
			</Drawer>

			<Button onclick={() => (rightOpen = true)}>Large (400px)</Button>
			<Drawer bind:open={rightOpen} position="right" size="400px">
				{#snippet header(close)}
					<h2>Large Drawer</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}
				<p>Ширина: <code>400px</code></p>
			</Drawer>

			<Button onclick={() => (formOpen = true)}>Extra Large (560px)</Button>
			<Drawer bind:open={formOpen} position="right" size="560px">
				{#snippet header(close)}
					<h2>Extra Large Drawer</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}
				<p>Ширина: <code>560px</code></p>
			</Drawer>
		</div>
	{/snippet}
</Story>

<Story name="No Overlay Close">
	{#snippet template()}
		<Button onclick={() => (strictOpen = true)}>Открыть строгий drawer</Button>

		<Drawer bind:open={strictOpen} position="right" closeOnOverlay={false}>
			{#snippet header(_close)}
				<h2>Обязательное действие</h2>
			{/snippet}

			<p>
				Этот drawer можно закрыть только нажав кнопку "Подтвердить", клавишу Escape или кнопку
				закрытия. Клик по оверлею не работает (<code>closeOnOverlay={false}</code>).
			</p>

			{#snippet footer(_close)}
				<Button
					onclick={() => {
						strictOpen = false;
					}}>Подтвердить</Button
				>
			{/snippet}
		</Drawer>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="position: relative;">
			<Button onclick={() => (drawerOpen = true)}>Открыть Drawer</Button>

			<Drawer bind:open={drawerOpen} position="left">
				{#snippet header(close)}
					<h2>Меню навигации</h2>
					<IconButton Icon={X} label="Закрыть меню" onclick={close} />
				{/snippet}

				<List>
					<ListItem>
						<User style="width: 20px;" />
						<span>Профиль</span>
					</ListItem>
					<ListItem>
						<Bell style="width: 20px;" />
						<span>Уведомления</span>
					</ListItem>
					<ListItem>
						<Settings style="width: 20px;" />
						<span>Настройки</span>
					</ListItem>
				</List>
			</Drawer>

			<div
				style="margin-top: 24px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Клавиатурная навигация:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Tab</kbd
						>
						<span style="color: var(--text-secondary);"
							>Навигация между элементами внутри drawer</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Shift + Tab</kbd
						>
						<span style="color: var(--text-secondary);">Навигация назад</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace; height: fit-content;"
							>Escape</kbd
						>
						<span style="color: var(--text-secondary);">Закрыть drawer</span>
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
						<code style="color: var(--color-primary);">role="dialog"</code>
						<span style="color: var(--text-secondary);">Диалоговое окно</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<code style="color: var(--color-primary);">aria-modal="true"</code>
						<span style="color: var(--text-secondary);">Модальное окно</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<code style="color: var(--color-primary);">aria-labelledby</code>
						<span style="color: var(--text-secondary);">Ссылка на заголовок (если есть header)</span
						>
					</div>
				</div>
			</div>

			<div
				style="margin-top: 16px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Особенности:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<span style="color: var(--text-secondary);"
							>• Фокус trap — Tab циклически перемещается внутри drawer</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<span style="color: var(--text-secondary);"
							>• Автофокус на первый интерактивный элемент при открытии</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<span style="color: var(--text-secondary);"
							>• Возврат фокуса на элемент-триггер при закрытии</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<span style="color: var(--text-secondary);"
							>• Scroll lock на body при открытом drawer</span
						>
					</div>
					<div style="display: flex; gap: 12px;">
						<span style="color: var(--text-secondary);"
							>• Drag-to-close для position="bottom" (touch + mouse)</span
						>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
