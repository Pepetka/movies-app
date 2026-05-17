<script lang="ts">
	import { Avatar, Button, Card, Input, toast } from '@repo/ui';
	import { Pencil, Save, Undo2, Image } from '@lucide/svelte';
	import { untrack } from 'svelte';

	import {
		EMPTY_PROFILE_FORM,
		profileFormFromEntity,
		profileFormToDto,
		validateProfileForm,
		profileStore,
		type ProfileFormData
	} from '$lib/modules/profile';
	import { createFormFieldValidator } from '$lib/utils';
	import { authStore } from '$lib/modules/auth';
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
	const fieldValidator = createFormFieldValidator(validateProfileForm);

	$effect(() => {
		return () => {
			fieldValidator.cancel();
			profileStore.resetUpdate();
		};
	});

	const handleEdit = () => {
		if (authStore.user) {
			form = profileFormFromEntity(authStore.user);
		}
		fieldValidator.reset();
		profileStore.resetUpdate();
		isEditing = true;
	};

	const handleCancel = () => {
		isEditing = false;
		fieldValidator.reset();
		profileStore.resetUpdate();
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (profileStore.isUpdating || !authStore.user) return;

		const validation = validateProfileForm(form);
		fieldValidator.setErrors(validation.errors);
		if (!validation.isValid || !validation.data) return;

		await profileStore.updateProfile(authStore.user.id, profileFormToDto(validation.data));

		if (profileStore.isUpdateSuccess) {
			toast.success('Профиль обновлён');
			isEditing = false;
		} else {
			toast.error(profileStore.updateError ?? 'Ошибка обновления профиля');
		}
	};
</script>

<svelte:head>
	<title>Профиль · Movies App</title>
</svelte:head>

<div class="profile-page">
	{#if authStore.user}
		{#if !isEditing}
			<div class="profile-page__view-mode">
				<div class="profile-page__user-info">
					<Avatar src={authStore.user.avatar} name={authStore.user.name} size="xl" />
					<p class="profile-page__name">{authStore.user.name}</p>
					<p class="profile-page__email">{authStore.user.email}</p>
				</div>
				<Button variant="secondary" onclick={handleEdit}>
					<Pencil size={16} />
					Редактировать профиль
				</Button>
			</div>
		{:else}
			<div class="form-page">
				<div class="form-branding">
					<div class="profile-page__avatar-header">
						<Avatar src={form.avatarUrl || undefined} name={form.name} size="xl" />
					</div>
					<h1 class="form-title">Редактирование профиля</h1>
					<p class="form-subtitle">Измените имя и аватар</p>
				</div>

				<Card variant="outlined" class="form-card">
					{#snippet header()}
						<div class="form-card-header">
							<h2 id="profile-form-title" class="form-card-title">Данные профиля</h2>
							<p class="form-card-subtitle">Обновите информацию о себе</p>
						</div>
					{/snippet}

					<form class="form-fields" onsubmit={handleSubmit} aria-labelledby="profile-form-title">
						<Input
							type="text"
							label="Имя"
							bind:value={form.name}
							error={fieldValidator.errors.name}
							placeholder="Ваше имя"
							disabled={profileStore.isUpdating}
							onChange={() => fieldValidator.handleFieldChange(form, 'name')}
						/>

						<Input
							type="url"
							label="Аватар"
							bind:value={form.avatarUrl}
							error={fieldValidator.errors.avatarUrl}
							Icon={Image}
							placeholder="https://example.com/avatar.jpg"
							disabled={profileStore.isUpdating}
							onChange={() => fieldValidator.handleFieldChange(form, 'avatarUrl')}
						/>

						<div class="profile-page__form-actions">
							<Button type="submit" variant="primary" fullWidth loading={profileStore.isUpdating}>
								<Save size={16} />
								Сохранить
							</Button>
							<Button type="button" variant="secondary" fullWidth onclick={handleCancel}>
								<Undo2 size={16} />
								Отмена
							</Button>
						</div>
					</form>
				</Card>
			</div>
		{/if}
	{:else}
		<p class="profile-page__empty">Загрузка профиля...</p>
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

	.profile-page__view-mode {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
	}

	.profile-page__user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.profile-page__name {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		margin: 0;
	}

	.profile-page__email {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.profile-page__empty {
		color: var(--text-secondary);
	}

	.profile-page__avatar-header {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-4);
	}

	.profile-page__form-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
