<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { X } from '@lucide/svelte';

	import Select from '../Select/Select.svelte';
	import { IconButton } from '../IconButton';
	import Input from '../Input/Input.svelte';
	import { Button } from '../Button';
	import { Sheet } from './';

	const { Story } = defineMeta({
		title: 'Components/Sheet',
		component: Sheet,
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

	let playgroundOpen = $state(false);
	let sizesOpen = $state(false);
	let confirmOpen = $state(false);
	let formOpen = $state(false);
	let strictOpen = $state(false);

	let userName = $state('');
	let userEmail = $state('');
	let userRole = $state('user');
</script>

<Story name="Playground">
	{#snippet template(args)}
		<Button onclick={() => (playgroundOpen = true)}>Open Sheet</Button>

		<Sheet bind:open={playgroundOpen} size="md" {...args}>
			{#snippet header(close)}
				<h2>Sheet</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<p>
				На мобильном (<code>&lt;640px</code>) отображается как Drawer снизу. На десктопе — как
				центрированная Modal.
			</p>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Отмена</Button>
				<Button
					onclick={() => {
						close();
					}}>OK</Button
				>
			{/snippet}
		</Sheet>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<Button onclick={() => (sizesOpen = true)}>Open Sheet (md)</Button>

		<Sheet bind:open={sizesOpen} size="md">
			{#snippet header(close)}
				<h2>Sheet Size: md</h2>
				<IconButton Icon={X} label="Close" onclick={close} />
			{/snippet}

			<p>Size влияет только на десктопный Modal. На мобильном всегда — Drawer на всю ширину.</p>

			{#snippet footer(close)}
				<Button variant="ghost" onclick={close}>Закрыть</Button>
			{/snippet}
		</Sheet>
	{/snippet}
</Story>

<Story name="Confirm Dialog">
	{#snippet template()}
		<Button onclick={() => (confirmOpen = true)}>Delete Item</Button>

		<Sheet bind:open={confirmOpen} size="sm">
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
		</Sheet>
	{/snippet}
</Story>

<Story name="Form Sheet">
	{#snippet template()}
		<Button onclick={() => (formOpen = true)}>Add User</Button>

		<Sheet bind:open={formOpen} size="md">
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
		</Sheet>
	{/snippet}
</Story>

<Story name="No Overlay Close">
	{#snippet template()}
		<Button onclick={() => (strictOpen = true)}>Open Strict Sheet</Button>

		<Sheet bind:open={strictOpen} size="md" closeOnOverlay={false}>
			{#snippet header()}
				<h2>Обязательное действие</h2>
			{/snippet}

			<p>
				Этот Sheet можно закрыть только кнопкой или Escape. Клик по оверлею не работает (<code
					>closeOnOverlay=false</code
				>).
			</p>

			{#snippet footer()}
				<Button
					onclick={() => {
						strictOpen = false;
					}}>Подтвердить</Button
				>
			{/snippet}
		</Sheet>
	{/snippet}
</Story>
