<script lang="ts">
	import { Eye, EyeOff, Film, Mail } from '@lucide/svelte';
	import { Button, Card, Input, toast } from '@repo/ui';

	import {
		authStore,
		type LoginFormData,
		validateLoginForm,
		createFormFieldValidator,
		EMPTY_LOGIN_FORM,
		loginFormToDto
	} from '$lib/modules/auth';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	import '$lib/styles/auth.css';

	let form = $state<LoginFormData>({ ...EMPTY_LOGIN_FORM });
	let showPassword = $state(false);

	const fieldValidator = createFormFieldValidator(validateLoginForm);

	$effect(() => {
		return () => {
			fieldValidator.cancel();
			authStore.resetForm();
		};
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (authStore.isLoggingIn) return;

		const validation = validateLoginForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;

		await authStore.login(loginFormToDto(form));

		if (authStore.isLoginSuccess) {
			toast.success('Добро пожаловать!');
			await goto(resolve(ROUTES.GROUPS), { replaceState: true });
		} else {
			toast.error(authStore.loginError ?? 'Ошибка входа');
		}
	};
</script>

<div class="auth-page">
	<div class="auth-branding">
		<a href={ROUTES.HOME} class="auth-logo-link">
			<div class="auth-logo">
				<Film />
			</div>
			<h1 class="auth-app-name">Movies App</h1>
		</a>
		<p class="auth-tagline">Смотрите фильмы вместе с друзьями</p>
	</div>

	<Card variant="outlined" size="responsive" class="auth-card">
		{#snippet header()}
			<div class="auth-card-header">
				<h2 class="auth-card-title">Вход</h2>
				<p class="auth-card-subtitle">Войдите в свой аккаунт</p>
			</div>
		{/snippet}

		<div class="auth-card-body">
			<form class="auth-form" onsubmit={handleSubmit}>
				<Input
					type="email"
					label="Email"
					bind:value={form.email}
					error={fieldValidator.errors.email}
					Icon={Mail}
					placeholder="anaconda@mail.ru"
					disabled={authStore.isLoggingIn}
					onChange={() => fieldValidator.handleFieldChange(form, 'email')}
				/>

				<Input
					type={showPassword ? 'text' : 'password'}
					label="Пароль"
					bind:value={form.password}
					error={fieldValidator.errors.password}
					placeholder="Введите пароль"
					Icon={showPassword ? EyeOff : Eye}
					iconAction={() => (showPassword = !showPassword)}
					iconLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
					autocomplete="current-password"
					disabled={authStore.isLoggingIn}
					onChange={() => fieldValidator.handleFieldChange(form, 'password')}
				/>

				<Button type="submit" variant="primary" fullWidth loading={authStore.isLoggingIn}
					>Войти</Button
				>
			</form>
		</div>

		{#snippet footer()}
			<div class="auth-card-footer">
				<p>
					Нет аккаунта? <a href={ROUTES.REGISTER}>Зарегистрироваться</a>
				</p>
			</div>
		{/snippet}
	</Card>
</div>
