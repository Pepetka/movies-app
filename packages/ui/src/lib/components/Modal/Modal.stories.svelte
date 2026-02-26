<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { X } from '@lucide/svelte';

	import Select from '../Select/Select.svelte';
	import { IconButton } from '../IconButton';
	import Input from '../Input/Input.svelte';
	import { Button } from '../Button';
	import { Modal } from './';

	const { Story } = defineMeta({
		title: 'Components/Modal',
		component: Modal,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: 'select',
				options: ['sm', 'md', 'lg', 'xl', 'full']
			},
			closeOnOverlay: { control: 'boolean' },
			closeOnEscape: { control: 'boolean' }
		}
	});

	let modalOpen = $state(false);
	let confirmOpen = $state(false);
	let formOpen = $state(false);
	let longContentOpen = $state(false);
	let simpleOpen = $state(false);
	let infoOpen = $state(false);
	let strictOpen = $state(false);
	let strict2Open = $state(false);
	let galleryOpen = $state(false);
	let focusOpen = $state(false);

	let userName = $state('');
	let userEmail = $state('');
	let userRole = $state('user');
</script>

<Story name="Playground">
	{#snippet template(args)}
		<Button onclick={() => (modalOpen = true)}>Open Modal</Button>

		<Modal bind:open={modalOpen} size="md" {...args}>
			{#snippet header(close)}
				<h2>Заголовок модального окна</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<p>Это базовое модальное окно с контентом.</p>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Отмена</Button>
				<Button
					onclick={() => {
						close();
					}}>OK</Button
				>
			{/snippet}
		</Modal>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 24px;">
			<Button onclick={() => (modalOpen = true)}>sm</Button>
			<Modal bind:open={modalOpen} size="sm">
				{#snippet header(close)}
					<h2>Modal Size: sm</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}

				<p>Max Width: <code>400px</code></p>

				{#snippet footer(close)}
					<Button variant="ghost" onclick={close}>Закрыть</Button>
				{/snippet}
			</Modal>

			<Button onclick={() => (confirmOpen = true)}>md</Button>
			<Modal bind:open={confirmOpen} size="md">
				{#snippet header(close)}
					<h2>Modal Size: md</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}

				<p>Max Width: <code>560px</code></p>

				{#snippet footer(close)}
					<Button variant="ghost" onclick={close}>Закрыть</Button>
				{/snippet}
			</Modal>

			<Button onclick={() => (formOpen = true)}>lg</Button>
			<Modal bind:open={formOpen} size="lg">
				{#snippet header(close)}
					<h2>Modal Size: lg</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}

				<p>Max Width: <code>720px</code></p>

				{#snippet footer(close)}
					<Button variant="ghost" onclick={close}>Закрыть</Button>
				{/snippet}
			</Modal>

			<Button onclick={() => (longContentOpen = true)}>xl</Button>
			<Modal bind:open={longContentOpen} size="xl">
				{#snippet header(close)}
					<h2>Modal Size: xl</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}

				<p>Max Width: <code>960px</code></p>

				{#snippet footer(close)}
					<Button variant="ghost" onclick={close}>Закрыть</Button>
				{/snippet}
			</Modal>

			<Button onclick={() => (simpleOpen = true)}>full</Button>
			<Modal bind:open={simpleOpen} size="full">
				{#snippet header(close)}
					<h2>Modal Size: full</h2>
					<IconButton Icon={X} label="Close" onclick={close} />
				{/snippet}

				<p>Max Width: <code>calc(100vw - 32px)</code></p>

				{#snippet footer(close)}
					<Button variant="ghost" onclick={close}>Закрыть</Button>
				{/snippet}
			</Modal>
		</div>
	{/snippet}
</Story>

<Story name="Confirm Dialog">
	{#snippet template()}
		<Button onclick={() => (confirmOpen = true)}>Delete Item</Button>

		<Modal bind:open={confirmOpen} size="sm">
			{#snippet header(close)}
				<h2>Подтверждение удаления</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<p>Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.</p>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Отмена</Button>
				<Button
					variant="primary"
					onclick={() => {
						close();
					}}>Удалить</Button
				>
			{/snippet}
		</Modal>
	{/snippet}
</Story>

<Story name="Form Modal">
	{#snippet template()}
		<Button onclick={() => (formOpen = true)}>Add User</Button>

		<Modal bind:open={formOpen} size="md">
			{#snippet header(close)}
				<h2>Добавить пользователя</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div style="display: flex; flex-direction: column; gap: var(--space-4);">
				<Input label="Имя" placeholder="Введите имя" bind:value={userName} />

				<Input type="email" label="Email" placeholder="example@mail.com" bind:value={userEmail} />

				<Select
					label="Роль"
					placeholder="Выберите роль"
					bind:value={userRole}
					options={[
						{ value: 'user', label: 'Пользователь' },
						{ value: 'moderator', label: 'Модератор' },
						{ value: 'admin', label: 'Администратор' }
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
		</Modal>
	{/snippet}
</Story>

<Story name="Long Content">
	{#snippet template()}
		<Button onclick={() => (longContentOpen = true)}>Open Long Content</Button>

		<Modal bind:open={longContentOpen} size="md">
			{#snippet header(close)}
				<h2>Условия использования</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div style="display: flex; flex-direction: column; gap: var(--space-4);">
				<p>
					Добро пожаловать в наше приложение! Прежде чем начать использовать наш сервис, пожалуйста,
					внимательно ознакомьтесь с условиями использования.
				</p>
				<h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
					1. Принятие условий
				</h3>
				<p>
					Используя наше приложение, вы соглашаетесь с этими условиями. Если вы не согласны с
					каким-либо положением, пожалуйста, не используйте сервис.
				</p>
				<h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
					2. Пользование сервисом
				</h3>
				<p>
					Вы соглашаетесь использовать сервис только в законных целях и не нарушать
					законодательство. Вы несете ответственность за всю деятельность, которая происходит под
					вашей учетной записью.
				</p>
				<h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
					3. Конфиденциальность
				</h3>
				<p>
					Мы ценим вашу приватность и собираем только необходимые данные для работы сервиса.
					Подробная информация доступна в нашей политике конфиденциальности.
				</p>
				<h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
					4. Ограничение ответственности
				</h3>
				<p>
					Мы не несем ответственности за любые убытки, возникшие в результате использования или
					невозможности использования нашего сервиса.
				</p>
				<h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
					5. Изменения условий
				</h3>
				<p>
					Мы оставляем за собой право изменять эти условия в любое время. О существенных изменениях
					мы уведомим вас заранее.
				</p>
				<h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
					6. Контактная информация
				</h3>
				<p>
					Если у вас есть вопросы по этим условиям, пожалуйста, свяжитесь с нашей службой поддержки
					через форму обратной связи.
				</p>
				<p>Благодарим вас за использование нашего приложения!</p>
			</div>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Закрыть</Button>
				<Button
					onclick={() => {
						close();
					}}>Принять</Button
				>
			{/snippet}
		</Modal>
	{/snippet}
</Story>

<Story name="Without Header">
	{#snippet template()}
		<Button onclick={() => (simpleOpen = true)}>Open Simple</Button>

		<Modal bind:open={simpleOpen} size="sm">
			<p style="text-align: center;">Простое модальное окно без заголовка и футера.</p>
			<div
				style="display: flex; justify-content: center; gap: var(--space-2); margin-top: var(--space-4);"
			>
				<Button onclick={() => (simpleOpen = false)}>OK</Button>
			</div>
		</Modal>
	{/snippet}
</Story>

<Story name="Without Footer">
	{#snippet template()}
		<Button onclick={() => (infoOpen = true)}>Open Info</Button>

		<Modal bind:open={infoOpen} size="md">
			{#snippet header(close)}
				<h2>Информация</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div style="text-align: center; padding: var(--space-6) 0;">
				<div
					style="width: 64px; height: 64px; background: var(--bg-secondary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4);"
				>
					<span style="font-size: 32px;">ℹ️</span>
				</div>
				<h3
					style="margin: 0 0 var(--space-2); font-size: var(--text-lg); font-weight: var(--font-semibold);"
				>
					Дополнительная информация
				</h3>
				<p style="margin: 0; color: var(--text-secondary);">
					Это модальное окно с информационным контентом. Закройте его, нажав на кнопку закрытия в
					заголовке или клавишу Escape.
				</p>
			</div>
		</Modal>
	{/snippet}
</Story>

<Story name="No Overlay Close">
	{#snippet template()}
		<Button onclick={() => (strictOpen = true)}>Open Strict Modal</Button>

		<Modal bind:open={strictOpen} size="md" closeOnOverlay={false}>
			{#snippet header()}
				<h2>Обязательное действие</h2>
			{/snippet}

			<p>
				Это модальное окно можно закрыть только нажав кнопку "Подтвердить" или клавишу Escape. Клик
				по оверлею не работает (<code>closeOnOverlay={false}</code>).
			</p>

			{#snippet footer()}
				<Button
					onclick={() => {
						strictOpen = false;
					}}>Подтвердить</Button
				>
			{/snippet}
		</Modal>
	{/snippet}
</Story>

<Story name="No Escape Close">
	{#snippet template()}
		<Button onclick={() => (strict2Open = true)}>Open Strict Modal 2</Button>

		<Modal bind:open={strict2Open} size="md" closeOnEscape={false}>
			{#snippet header()}
				<h2>Только явное закрытие</h2>
				<IconButton Icon={X} label="Close" onclick={() => (strict2Open = false)} />
			{/snippet}

			<p>
				Это модальное окно нельзя закрыть клавишей Escape (<code>closeOnEscape={false}</code>).
				Только кнопки или оверлей.
			</p>
		</Modal>
	{/snippet}
</Story>

<Story name="Custom Content">
	{#snippet template()}
		<Button onclick={() => (galleryOpen = true)}>Image Gallery</Button>

		<Modal bind:open={galleryOpen} size="lg">
			{#snippet header(close)}
				<h2>Галерея изображений</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<div
				style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); padding: var(--space-2) 0;"
			>
				{#each [1, 2, 3, 4, 5, 6] as i (i)}
					<div
						style="aspect-ratio: 1; background: var(--bg-secondary); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer;"
					>
						🖼️
					</div>
				{/each}
			</div>

			{#snippet footer(close)}
				<span style="margin-right: auto; color: var(--text-tertiary); font-size: var(--text-sm);">
					6 изображений
				</span>
				<Button variant="ghost" onclick={close}>Закрыть</Button>
			{/snippet}
		</Modal>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<Button onclick={() => (focusOpen = true)}>Focus Trap Demo</Button>

		<Modal bind:open={focusOpen} size="md">
			{#snippet header(close)}
				<h2>Focus Trap</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<p style="margin-bottom: var(--space-4);">
				Фокус клавиши Tab цикличен внутри модального окна. Попробуйте:
			</p>
			<ul
				style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: var(--space-2);"
			>
				<li>Нажимайте Tab для перемещения вперёд</li>
				<li>Shift+Tab для перемещения назад</li>
				<li>Escape для закрытия</li>
			</ul>
			<div
				style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);"
			>
				<Input label="Поле 1" placeholder="Поле 1" bind:value={userName} />
				<Input label="Поле 2" placeholder="Поле 2" bind:value={userEmail} />
				<Button variant="secondary">Button</Button>
			</div>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Отмена</Button>
				<Button
					onclick={() => {
						close();
					}}>OK</Button
				>
			{/snippet}
		</Modal>
	{/snippet}
</Story>
