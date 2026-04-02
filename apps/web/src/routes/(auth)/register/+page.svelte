<script lang="ts">
	import { Eye, EyeOff, Film, Mail, User, Users } from '@lucide/svelte';
	import { Button, Card, Input, toast } from '@repo/ui';
	import { fade } from 'svelte/transition';

	import {
		authStore,
		type RegisterFormData,
		validateRegisterForm,
		checkPasswordStrength,
		createFormFieldValidator,
		EMPTY_REGISTER_FORM,
		registerFormToDto
	} from '$lib/modules/auth';
	import { ROUTES, withCurrentQuery, getSafeRedirect } from '$lib/utils';
	import { goto } from '$app/navigation';

	import '$lib/styles/auth.css';

	let form = $state<RegisterFormData>({ ...EMPTY_REGISTER_FORM });

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	const fieldValidator = createFormFieldValidator(validateRegisterForm);
	const passwordChecks = $derived(checkPasswordStrength(form.password));

	const loginHref = $derived(withCurrentQuery(ROUTES.LOGIN, ['redirect']));

	$effect(() => {
		return () => {
			fieldValidator.cancel();
			authStore.resetForm();
		};
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (authStore.isRegistering) return;

		const validation = validateRegisterForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;

		await authStore.register(registerFormToDto(form));

		if (authStore.isRegisterSuccess) {
			toast.success('Регистрация успешна!');
			await goto(getSafeRedirect(), { replaceState: true });
		} else {
			toast.error(authStore.registerError ?? 'Ошибка регистрации');
		}
	};
</script>

<svelte:head>
	<title>Регистрация · Movies App</title>
</svelte:head>

<div class="form-page auth-page">
	<div class="form-branding">
		<a href={ROUTES.HOME} class="auth-logo-link">
			<div class="auth-logo">
				<Film />
			</div>
			<h1 class="auth-app-name">Movies App</h1>
		</a>
		<p class="auth-tagline">Смотрите фильмы вместе с друзьями</p>
	</div>

	<Card variant="outlined" size="responsive" class="form-card">
		{#snippet header()}
			<div class="form-card-header">
				<h2 class="form-card-title">Создать аккаунт</h2>
				<p class="form-card-subtitle">Присоединяйтесь к просмотрам фильмов</p>
			</div>
		{/snippet}

		<div class="auth-benefits">
			<div class="auth-benefit">
				<Users />
				<span>Создавайте группы</span>
			</div>
			<div class="auth-benefit">
				<Film />
				<span>Выбирайте фильмы вместе</span>
			</div>
		</div>

		<form class="form-fields" onsubmit={handleSubmit}>
			<Input
				type="text"
				label="Имя"
				bind:value={form.name}
				error={fieldValidator.errors.name}
				placeholder="Маргарита Александровна"
				Icon={User}
				disabled={authStore.isRegistering}
				onChange={() => fieldValidator.handleFieldChange(form, 'name')}
			/>

			<Input
				type="email"
				label="Email"
				bind:value={form.email}
				error={fieldValidator.errors.email}
				placeholder="anaconda@mail.ru"
				Icon={Mail}
				autocomplete="email"
				disabled={authStore.isRegistering}
				onChange={() => fieldValidator.handleFieldChange(form, 'email')}
			/>

			<div class="password-field">
				<Input
					type={showPassword ? 'text' : 'password'}
					label="Пароль"
					bind:value={form.password}
					error={fieldValidator.errors.password}
					placeholder="Str0ng!Pass"
					Icon={showPassword ? EyeOff : Eye}
					iconAction={() => (showPassword = !showPassword)}
					iconLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
					autocomplete="new-password"
					disabled={authStore.isRegistering}
					onChange={() => fieldValidator.handleFieldChange(form, 'password')}
				/>

				{#if form.password}
					<div class="password-requirements" transition:fade={{ duration: 200 }}>
						<span class:passed={passwordChecks.length}>8+</span>
						<span class:passed={passwordChecks.lowercase}>a-z</span>
						<span class:passed={passwordChecks.uppercase}>A-Z</span>
						<span class:passed={passwordChecks.number}>0-9</span>
						<span class:passed={passwordChecks.special}>!@#</span>
					</div>
				{/if}
			</div>

			<Input
				type={showConfirmPassword ? 'text' : 'password'}
				label="Подтверждение пароля"
				bind:value={form.confirmPassword}
				error={fieldValidator.errors.confirmPassword}
				placeholder="Повторите пароль"
				Icon={showConfirmPassword ? EyeOff : Eye}
				iconAction={() => (showConfirmPassword = !showConfirmPassword)}
				iconLabel={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
				autocomplete="new-password"
				disabled={authStore.isRegistering}
				onChange={() => fieldValidator.handleFieldChange(form, 'confirmPassword')}
			/>

			<Button type="submit" variant="primary" fullWidth loading={authStore.isRegistering}>
				Зарегистрироваться
			</Button>
		</form>

		{#snippet footer()}
			<div class="form-footer">
				<p>
					Уже есть аккаунт? <a href={loginHref}>Войти</a>
				</p>
			</div>
		{/snippet}
	</Card>
</div>
