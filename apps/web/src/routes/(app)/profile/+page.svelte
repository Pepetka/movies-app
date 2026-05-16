<script lang="ts">
	import { Avatar, Button, Card, Input, toast } from '@repo/ui';
	import { Pencil, Save, Undo2, Image } from '@lucide/svelte';
	import { untrack } from 'svelte';

	import {
		EMPTY_PROFILE_FORM,
		profileFormFromEntity,
		profileFormToDto,
		validateProfileForm,
		type ProfileFormData
	} from '$lib/modules/auth';
	import { createFormFieldValidator } from '$lib/utils';
	import { authStore } from '$lib/modules/auth';
	import { queryRegistry } from '$lib/query';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import '$lib/styles/form-base.css';

	$effect(() => {
		topBarStore.configure({
			title: 'Профиль'
		});

		return () => topBarStore.destroy();
	});

	let handledLinked = $state(false);

	$effect(() => {
		if (page.url.searchParams.get('linked') !== '1') return;
		if (untrack(() => handledLinked)) return;
		untrack(() => {
			handledLinked = true;
		});
		toast.success('Аккаунт успешно привязан');
		const url = new URL(page.url);
		url.searchParams.delete('linked');
		void goto(`${url.pathname}${url.search}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	});

	// === Profile editing ===

	let isEditing = $state(false);
	let form = $state<ProfileFormData>({ ...EMPTY_PROFILE_FORM });
	let isFormInitialized = $state(false);
	const fieldValidator = createFormFieldValidator(validateProfileForm);

	$effect(() => {
		if (authStore.user && isEditing && !isFormInitialized) {
			untrack(() => {
				form = profileFormFromEntity(authStore.user!);
				isFormInitialized = true;
			});
		}
	});

	$effect(() => {
		return () => {
			fieldValidator.cancel();
			authStore.resetProfileForm();
			isFormInitialized = false;
		};
	});

	const handleEdit = () => {
		if (authStore.user) {
			form = profileFormFromEntity(authStore.user);
		}
		fieldValidator.reset();
		isEditing = true;
	};

	const handleCancel = () => {
		isEditing = false;
		fieldValidator.reset();
		authStore.resetProfileForm();
		isFormInitialized = false;
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (authStore.isUpdatingProfile || !authStore.user) return;

		const validation = validateProfileForm(form);
		fieldValidator.setErrors(validation.errors);
		if (!validation.isValid) return;

		await authStore.updateProfile(authStore.user.id, profileFormToDto(form));

		if (authStore.isUpdateProfileSuccess) {
			toast.success('Профиль обновлён');
			isEditing = false;
			queryRegistry.invalidateByKey(['currentUser']);
		} else {
			toast.error(authStore.updateProfileError ?? 'Ошибка обновления профиля');
		}
	};
</script>

<svelte:head>
	<title>Профиль · Movies App</title>
</svelte:head>

<div class="profile-page">
	{#if authStore.user}
		{#if !isEditing}
			<div class="view-mode">
				<div class="user-info">
					<Avatar src={authStore.user.avatar} name={authStore.user.name} size="xl" />
					<p class="name">{authStore.user.name}</p>
					<p class="email">{authStore.user.email}</p>
				</div>
				<Button variant="secondary" onclick={handleEdit}>
					<Pencil size={16} />
					Редактировать профиль
				</Button>
			</div>
		{:else}
			<div class="form-page">
				<div class="form-branding">
					<div class="profile-form-avatar-header">
						<Avatar src={form.avatarUrl || undefined} name={form.name} size="xl" />
					</div>
					<h1 class="form-title">Редактирование профиля</h1>
					<p class="form-subtitle">Измените имя и аватар</p>
				</div>

				<Card variant="outlined" class="form-card">
					{#snippet header()}
						<div class="form-card-header">
							<h2 class="form-card-title">Данные профиля</h2>
							<p class="form-card-subtitle">Обновите информацию о себе</p>
						</div>
					{/snippet}

					<form class="form-fields" onsubmit={handleSubmit}>
						<Input
							type="text"
							label="Имя"
							bind:value={form.name}
							error={fieldValidator.errors.name}
							placeholder="Ваше имя"
							disabled={authStore.isUpdatingProfile}
							onChange={() => fieldValidator.handleFieldChange(form, 'name')}
						/>

						<Input
							type="url"
							label="Аватар"
							bind:value={form.avatarUrl}
							error={fieldValidator.errors.avatarUrl}
							Icon={Image}
							placeholder="https://example.com/avatar.jpg"
							disabled={authStore.isUpdatingProfile}
							onChange={() => fieldValidator.handleFieldChange(form, 'avatarUrl')}
						/>

						<div class="form-actions">
							<Button
								type="submit"
								variant="primary"
								fullWidth
								loading={authStore.isUpdatingProfile}
							>
								<Save size={16} />
								Сохранить
							</Button>
							<Button
								type="button"
								variant="danger"
								fullWidth
								disabled={authStore.isUpdatingProfile}
								onclick={handleCancel}
							>
								<Undo2 size={16} />
								Отмена
							</Button>
						</div>
					</form>
				</Card>
			</div>
		{/if}
	{:else}
		<p class="empty">Загрузка профиля...</p>
	{/if}
</div>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-block: var(--space-4);
		text-align: center;
	}

	.view-mode {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.name {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		margin: 0;
	}

	.email {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.empty {
		color: var(--text-secondary);
	}

	.profile-form-avatar-header {
		margin-bottom: var(--space-4);
	}

	.form-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
