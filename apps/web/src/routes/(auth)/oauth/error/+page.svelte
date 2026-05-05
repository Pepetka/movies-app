<script lang="ts">
	import { page } from '$app/state';

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
		access_denied: 'Доступ отклонен пользователем.'
	};

	const rawReason = page.url.searchParams.get('reason') ?? 'unknown';
	const reason = $derived(REASON_MESSAGES[rawReason] ?? 'Неизвестная ошибка авторизации.');
</script>

<h1>Ошибка OAuth</h1>
<p>{reason}</p>
<a href="/login">Вернуться к входу</a>
