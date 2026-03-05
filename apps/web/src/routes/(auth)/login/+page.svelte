<script lang="ts">
	import { Eye, EyeOff, Film, Mail } from '@lucide/svelte';
	import { Button, Card, Input } from '@repo/ui';
	import { onMount } from 'svelte';

	import {
		authStore,
		type LoginFormData,
		validateLoginForm,
		createFormFieldValidator
	} from '$lib/modules/auth';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';

	import '$lib/styles/auth.css';

	let form = $state<LoginFormData>({
		email: '',
		password: ''
	});

	let showPassword = $state(false);
	let isLoading = $state(false);

	const fieldValidator = createFormFieldValidator(validateLoginForm);

	onMount(() => {
		return () => fieldValidator.cancel();
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (isLoading) return;
		isLoading = true;

		try {
			const result = await authStore.login(form);
			fieldValidator.setErrors(result.errors);

			if (result.isValid) {
				await goto(ROUTES.GROUPS, { replaceState: true });
			}
		} finally {
			isLoading = false;
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

	<Card variant="outlined" class="auth-card">
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
					disabled={isLoading}
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
					disabled={isLoading}
					onChange={() => fieldValidator.handleFieldChange(form, 'password')}
				/>

				<Button type="submit" variant="primary" fullWidth loading={isLoading}>Войти</Button>
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
