<script lang="ts">
	import { Avatar, Button, Card, Divider, Input, Textarea } from '@repo/ui';
	import { Image, Save, Sparkles, Users } from '@lucide/svelte';

	import { createFormFieldValidator, debounce, DEBOUNCE } from '$lib/utils';

	import { validateGroupForm, EMPTY_GROUP_FORM, type GroupFormProps } from './validation.svelte';

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
		form = $bindable({ ...EMPTY_GROUP_FORM }),
		isSubmitting = false
	}: GroupFormProps = $props();

	const fieldValidator = createFormFieldValidator(validateGroupForm);

	// Debounce avatar name to prevent color flickering during input (avatar color depends on name)
	let debouncedName = $state(form.name);
	const updateDebouncedName = debounce((value: string) => {
		debouncedName = value;
	}, DEBOUNCE.AVATAR_NAME);

	// Debounced update on user input
	$effect(() => {
		updateDebouncedName(form.name);
	});

	// Instant sync on external change (e.g., loading group data)
	$effect(() => {
		if (form.name !== debouncedName && !updateDebouncedName.pending()) {
			debouncedName = form.name;
		}
	});

	$effect(() => {
		return () => {
			fieldValidator.reset();
			updateDebouncedName.cancel();
		};
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (isSubmitting) return;

		const validation = validateGroupForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;

		await onSubmit?.();
	};
</script>

<div class="form-page">
	<div class="form-branding">
		<div class="group-form-avatar-header">
			<Avatar src={form.avatarUrl} name={debouncedName} size="xl" alt="Превью аватара группы" />
		</div>
		<h1 class="form-title">
			{title || (mode === 'create' ? 'Создание группы' : 'Редактирование')}
		</h1>
		<p class="form-subtitle">
			{subtitle ||
				(mode === 'create'
					? 'Соберите друзей для совместных просмотров'
					: 'Измените данные группы')}
		</p>
	</div>

	<Card variant="outlined" class="form-card">
		{#snippet header()}
			<div class="form-card-header">
				<h2 class="form-card-title">
					{cardTitle || 'Данные группы'}
				</h2>
				<p class="form-card-subtitle">
					{cardSubtitle ||
						(mode === 'create' ? 'Заполните информацию о группе' : 'Обновите информацию о группе')}
				</p>
			</div>
		{/snippet}

		<form class="form-fields" onsubmit={handleSubmit}>
			<Input
				type="text"
				label="Название"
				bind:value={form.name}
				error={fieldValidator.errors.name}
				Icon={Users}
				placeholder="Киноклуб «Вечерний сеанс»"
				disabled={isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'name')}
			/>

			<Textarea
				bind:value={form.description}
				label="Описание"
				error={fieldValidator.errors.description}
				placeholder="Расскажите о вашей группе — какие фильмы смотрите, как часто встречаетесь..."
				rows={3}
				maxlength={500}
				disabled={isSubmitting}
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
				disabled={isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'avatarUrl')}
			/>

			<Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
				<SubmitIcon size={16} />
				{submitLabel}
			</Button>
		</form>
	</Card>
</div>
