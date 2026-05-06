<script lang="ts">
	import { Film } from '@lucide/svelte';
	import { Card } from '@repo/ui';

	import { ROUTES, withCurrentQuery } from '$lib/utils';
	import { OAuthSection } from '$lib/modules/auth';

	import '$lib/styles/auth.css';

	const loginHref = $derived(withCurrentQuery(ROUTES.LOGIN, ['redirect']));
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
				<p class="form-card-subtitle">
					Регистрация доступна только через Google. Это быстро и безопасно.
				</p>
			</div>
		{/snippet}

		<div class="auth-oauth-section">
			<OAuthSection buttonText="Продолжить с Google" showDivider={false} />
		</div>

		{#snippet footer()}
			<div class="form-footer">
				<p>
					Уже есть аккаунт? <a href={loginHref}>Войти</a>
				</p>
			</div>
		{/snippet}
	</Card>
</div>
