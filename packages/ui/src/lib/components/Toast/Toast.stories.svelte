<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';

	import { ToastContainer, toast } from './';
	import { Button } from '../Button';

	const { Story } = defineMeta({
		title: 'Components/Toast',
		component: ToastContainer,
		tags: ['autodocs'],
		argTypes: {
			position: {
				control: 'select',
				options: [
					'bottom-center',
					'bottom-left',
					'bottom-right',
					'top-center',
					'top-left',
					'top-right'
				]
			},
			maxToasts: { control: 'number' }
		}
	});
</script>

<Story name="Playground">
	{#snippet template()}
		<ToastContainer />
		<div style="display: flex; flex-direction: column; gap: 12px; padding: 24px;">
			<Button onclick={() => toast.success('Сохранено успешно')}>Success Toast</Button>
			<Button onclick={() => toast.error('Произошла ошибка')}>Error Toast</Button>
			<Button onclick={() => toast.info('Обновление доступно')}>Info Toast</Button>
			<Button onclick={() => toast.warning('Сессия истекает')}>Warning Toast</Button>
			<Button onclick={() => toast.clear()}>Clear All</Button>
		</div>
	{/snippet}
</Story>

<Story name="All Types">
	{#snippet template()}
		<ToastContainer />
		<div style="display: flex; flex-direction: column; gap: 12px; padding: 24px;">
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>success</span
				>
				<Button variant="secondary" onclick={() => toast.success('Данные успешно сохранены')}>
					Show Success
				</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>error</span
				>
				<Button variant="secondary" onclick={() => toast.error('Не удалось выполнить операцию')}>
					Show Error
				</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>info</span
				>
				<Button
					variant="secondary"
					onclick={() => toast.info('Новая версия доступна для загрузки')}
				>
					Show Info
				</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>warning</span
				>
				<Button variant="secondary" onclick={() => toast.warning('Истекает срок действия токена')}>
					Show Warning
				</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Success">
	{#snippet template()}
		<ToastContainer />
		<div style="padding: 24px;">
			<Button onclick={() => toast.success('Данные успешно сохранённые')}>Success</Button>
			<Button onclick={() => toast.success('Файл загружен')}>With Different Message</Button>
		</div>
	{/snippet}
</Story>

<Story name="Error">
	{#snippet template()}
		<ToastContainer />
		<div style="padding: 24px;">
			<Button onclick={() => toast.error('Произошла ошибка')}>Error</Button>
			<Button onclick={() => toast.error('Не удалось сохранить изменения')}>
				With Different Message
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Info">
	{#snippet template()}
		<ToastContainer />
		<div style="padding: 24px;">
			<Button onclick={() => toast.info('Информационное сообщение')}>Info</Button>
			<Button onclick={() => toast.info('Доступно обновление')}>With Different Message</Button>
		</div>
	{/snippet}
</Story>

<Story name="Warning">
	{#snippet template()}
		<ToastContainer />
		<div style="padding: 24px;">
			<Button onclick={() => toast.warning('Предупреждение')}>Warning</Button>
			<Button onclick={() => toast.warning('Сессия истекает через 5 минут')}>
				With Different Message
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="With Action">
	{#snippet template()}
		<ToastContainer />
		<div style="display: flex; flex-direction: column; gap: 12px; padding: 24px;">
			<Button
				onclick={() =>
					toast.error('Ошибка сохранения', {
						action: { label: 'Повторить', onClick: () => fn() }
					})}
			>
				Error with Retry
			</Button>
			<Button
				onclick={() =>
					toast.info('Доступно обновление', {
						action: { label: 'Обновить', onClick: () => fn() }
					})}
			>
				Info with Action
			</Button>
			<Button
				onclick={() =>
					toast.success('Файл загружен', {
						action: { label: 'Открыть', onClick: () => fn() }
					})}
			>
				Success with Open
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Persistent">
	{#snippet template()}
		<ToastContainer />
		<div style="display: flex; flex-direction: column; gap: 12px; padding: 24px;">
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>duration: 0</span
				>
				<Button onclick={() => toast.info('Выполняется загрузка...', { duration: 0 })}>
					Show Persistent
				</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>with action</span
				>
				<Button
					onclick={() =>
						toast.warning('Долгая операция', {
							duration: 0,
							action: { label: 'Отмена', onClick: () => fn() }
						})}
				>
					Persistent with Action
				</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Positions Top Left" args={{ position: 'top-left' }}>
	{#snippet template()}
		<ToastContainer position="top-left" />
		<div style="padding: 24px;">
			<Button onclick={() => toast.success('Top Left Position', { duration: 0 })}>
				Show Top Left
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Positions Top Center" args={{ position: 'top-center' }}>
	{#snippet template()}
		<ToastContainer position="top-center" />
		<div style="padding: 24px;">
			<Button onclick={() => toast.info('Top Center Position', { duration: 0 })}>
				Show Top Center
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Positions Top Right" args={{ position: 'top-right' }}>
	{#snippet template()}
		<ToastContainer position="top-right" />
		<div style="padding: 24px;">
			<Button onclick={() => toast.error('Top Right Position', { duration: 0 })}>
				Show Top Right
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Positions Bottom Left" args={{ position: 'bottom-left' }}>
	{#snippet template()}
		<ToastContainer position="bottom-left" />
		<div style="padding: 24px;">
			<Button onclick={() => toast.warning('Bottom Left Position', { duration: 0 })}>
				Show Bottom Left
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Positions Bottom Center" args={{ position: 'bottom-center' }}>
	{#snippet template()}
		<ToastContainer position="bottom-center" />
		<div style="padding: 24px;">
			<Button onclick={() => toast.success('Bottom Center Position', { duration: 0 })}>
				Show Bottom Center
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Positions Bottom Right" args={{ position: 'bottom-right' }}>
	{#snippet template()}
		<ToastContainer position="bottom-right" />
		<div style="padding: 24px;">
			<Button onclick={() => toast.info('Bottom Right Position', { duration: 0 })}>
				Show Bottom Right
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Stacking">
	{#snippet template()}
		<ToastContainer maxToasts={5} />
		<div style="display: flex; flex-direction: column; gap: 12px; padding: 24px;">
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>maxToasts: 5</span
				>
				<Button
					onclick={() => {
						for (let i = 1; i <= 3; i++) {
							setTimeout(() => {
								toast.success(`Тост #${i}`);
							}, i * 200);
						}
					}}
				>
					Add 3 Toasts
				</Button>
			</div>
			<Button onclick={() => toast.clear()}>Clear All</Button>
		</div>
	{/snippet}
</Story>

<Story name="Swipe To Dismiss">
	{#snippet template()}
		<ToastContainer />
		<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
			<p style="color: var(--text-secondary); max-width: 400px;">
				Тосты можно смахивать для закрытия. Работает как с touch-жестами на мобильных устройствах,
				так и с мышью на десктопе. Перетащите тост влево или вправо более чем на 100px для закрытия.
			</p>
			<div style="display: flex; gap: 12px;">
				<Button onclick={() => toast.info('Смахни меня!', { duration: 0 })}>
					Info (persistent)
				</Button>
				<Button onclick={() => toast.success('Смахни для закрытия', { duration: 0 })}>
					Success (persistent)
				</Button>
			</div>
			<p style="font-size: var(--text-sm); color: var(--text-tertiary);">
				Примечание: тосты с duration: 0 не закрываются автоматически
			</p>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<ToastContainer />
		<div style="max-width: 400px; padding: 24px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Форма обратной связи</h3>
			<div
				style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<p style="margin-bottom: 16px; color: var(--text-secondary);">
					Пример использования тостов в реальном сценарии отправки формы.
				</p>
				<div style="display: flex; gap: 12px;">
					<Button
						onclick={() => {
							toast.success('Сообщение отправлено!');
							fn();
						}}
					>
						Отправить
					</Button>
					<Button
						variant="ghost"
						onclick={() => {
							toast.error('Ошибка валидации', {
								action: { label: 'Исправить', onClick: () => fn() }
							});
						}}
					>
						С ошибкой
					</Button>
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Управление файлами</h3>
			<div
				style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 24px;"
			>
				<p style="margin-bottom: 16px; color: var(--text-secondary);">
					Загрузка файла с индикацией прогресса и возможностью повторить при ошибке.
				</p>
				<div style="display: flex; gap: 12px;">
					<Button
						variant="secondary"
						onclick={() =>
							toast.info('Загрузка файла...', {
								duration: 0,
								action: { label: 'Отмена', onClick: () => fn() }
							})}
					>
						Загрузить
					</Button>
					<Button
						variant="secondary"
						onclick={() =>
							toast.error('Ошибка загрузки', {
								action: { label: 'Повторить', onClick: () => fn() }
							})}
					>
						Ошибка
					</Button>
				</div>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Автосохранение</h3>
			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<p style="margin-bottom: 16px; color: var(--text-secondary);">
					Демонстрация автоматического закрытия тоста через заданное время.
				</p>
				<div style="display: flex; gap: 12px;">
					<Button
						variant="secondary"
						onclick={() => toast.success('Изменения сохранены', { duration: 2000 })}
					>
						Быстрое (2с)
					</Button>
					<Button
						variant="secondary"
						onclick={() => toast.success('Изменения сохранены', { duration: 5000 })}
					>
						Медленное (5с)
					</Button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
