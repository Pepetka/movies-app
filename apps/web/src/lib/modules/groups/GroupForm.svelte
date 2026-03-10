<script lang="ts" generics="IProps extends GroupFormProps">
	import { Avatar, Button, Card, Divider, Input, Textarea } from '@repo/ui';
	import { Image, Save, Sparkles, Users } from '@lucide/svelte';

	import { createFormFieldValidator, debounce } from '$lib/utils';

	import { groupsStore, validateGroupForm, type GroupFormProps } from './';

	import '$lib/styles/group-form.css';

	let {
		mode = 'create',
		title,
		subtitle,
		cardTitle,
		cardSubtitle,
		submitLabel = mode === 'create' ? 'Создать' : 'Сохранить',
		submitIcon: SubmitIcon = mode === 'create' ? Sparkles : Save,
		onSubmit,
		form = $bindable({
			name: '',
			description: '',
			avatarUrl: ''
		})
	}: IProps = $props();

	const fieldValidator = createFormFieldValidator(validateGroupForm);

	let debouncedName = $state(form.name);
	const updateDebouncedName = debounce((value: string) => {
		debouncedName = value;
	}, 300);

	$effect(() => {
		updateDebouncedName(form.name);
	});

	$effect(() => {
		return () => {
			fieldValidator.reset();
			updateDebouncedName.cancel();
		};
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (groupsStore.isSubmitting) return;

		const validation = validateGroupForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;

		await onSubmit?.();
	};
</script>

<div class="group-form-page">
	<div class="group-form-branding">
		<div class="group-form-avatar-header">
			<Avatar
				src={form.avatarUrl || undefined}
				name={debouncedName || '?'}
				size="xl"
				alt="Превью аватара группы"
			/>
		</div>
		<h1 class="group-form-title">
			{title || (mode === 'create' ? 'Создание группы' : 'Редактирование')}
		</h1>
		<p class="group-form-subtitle">
			{subtitle ||
				(mode === 'create'
					? 'Соберите друзей для совместных просмотров'
					: 'Измените данные группы')}
		</p>
	</div>

	<Card variant="outlined" class="group-form-card">
		{#snippet header()}
			<div class="group-form-card-header">
				<h2 class="group-form-card-title">
					{cardTitle || 'Данные группы'}
				</h2>
				<p class="group-form-card-subtitle">
					{cardSubtitle ||
						(mode === 'create' ? 'Заполните информацию о группе' : 'Обновите информацию о группе')}
				</p>
			</div>
		{/snippet}

		<form class="group-form-fields" onsubmit={handleSubmit}>
			<Input
				type="text"
				label="Название"
				bind:value={form.name}
				error={fieldValidator.errors.name}
				Icon={Users}
				placeholder="Киноклуб «Вечерний сеанс»"
				disabled={groupsStore.isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'name')}
			/>

			<Textarea
				bind:value={form.description}
				label="Описание"
				error={fieldValidator.errors.description}
				placeholder="Расскажите о вашей группе — какие фильмы смотрите, как часто встречаетесь..."
				rows={3}
				maxlength={500}
				disabled={groupsStore.isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'description')}
			/>

			<Divider label="Настройки" class="group-form-divider" />

			<Input
				type="url"
				label="Изображение"
				bind:value={form.avatarUrl}
				error={fieldValidator.errors.avatarUrl}
				Icon={Image}
				placeholder="https://example.com/group-avatar.jpg"
				disabled={groupsStore.isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'avatarUrl')}
			/>

			<Button type="submit" variant="primary" fullWidth loading={groupsStore.isSubmitting}>
				<SubmitIcon size={16} />
				{submitLabel}
			</Button>
		</form>
	</Card>
</div>
