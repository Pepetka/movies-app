<script lang="ts">
	import { Card } from '@repo/ui';

	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	import '$lib/styles/auth.css';

	const REASON_MESSAGES: Record<string, string> = {
		invalid_state: 'Неверный параметр state. Возможна попытка CSRF-атаки.',
		missing_code: 'Отсутствует код авторизации от провайдера.',
		oauth_email_unverified: 'Email не подтвержден в провайдере.',
		oauth_code_exchange_failed: 'Ошибка обмена кода на токен.',
		oauth_provider_not_configured: 'Провайдер не настроен на сервере.',
		oauth_unsupported_provider: 'Неподдерживаемый провайдер.',
		oauth_link_email_mismatch: 'Email провайдера не совпадает с email аккаунта.',
		oauth_account_already_linked: 'Аккаунт провайдера уже привязан к другому пользователю.',
		invalid_session: 'Недействительная сессия привязки.',
		invalid_intent: 'Неверный тип OAuth-операции.',
		access_denied: 'Доступ отклонен пользователем.',
		oauth_failed: 'Ошибка авторизации через провайдер.',
		invalid_request: 'Некорректный запрос к провайдеру.',
		unauthorized_client: 'Клиент не авторизован в провайдере.',
		server_error: 'Внутренняя ошибка провайдера.',
		temporarily_unavailable: 'Провайдер временно недоступен.'
	};

	const reason = $derived(
		REASON_MESSAGES[page.url.searchParams.get('reason') ?? 'unknown'] ??
			'Неизвестная ошибка авторизации.'
	);
</script>

<svelte:head>
	<title>Ошибка OAuth · Movies App</title>
</svelte:head>

<div class="form-page auth-page">
	<div class="form-branding">
		<h1 class="auth-app-name">Ошибка авторизации</h1>
		<p class="auth-tagline">Что-то пошло не так при входе через провайдер</p>
	</div>

	<Card variant="outlined" size="responsive" class="form-card">
		<div class="form-card-header" role="alert">
			<h2 class="form-card-title">{reason}</h2>
		</div>

		<a href={ROUTES.LOGIN} class="form-link">Вернуться к входу</a>
	</Card>
</div>
