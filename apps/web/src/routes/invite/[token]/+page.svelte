<script lang="ts">
	import { AlertCircle, Film, LogIn, Users } from '@lucide/svelte';
	import { Avatar, Button, Card, Spinner, toast } from '@repo/ui';

	import { inviteStore } from '$lib/modules/groups';
	import { ROUTES, buildPath } from '$lib/utils';
	import { authStore } from '$lib/modules/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import '$lib/styles/auth.css';

	const token = $derived(page.params.token ?? '');

	$effect(() => {
		if (token) {
			void inviteStore.fetchInviteInfo(token);
		}
		return () => {
			inviteStore.reset();
			inviteStore.resetForm();
		};
	});

	const isNotLoggedIn = $derived(authStore.isInitialized && !authStore.isAuthenticated);
	const showGroupInfo = $derived(inviteStore.isLoaded && inviteStore.inviteInfo !== null);

	const handleLogin = () => {
		void goto(buildPath(ROUTES.LOGIN, { redirect: ROUTES.INVITE(token) }));
	};

	const handleAccept = async () => {
		if (inviteStore.isAccepting || !token) return;

		await inviteStore.acceptInvite(token);

		if (inviteStore.isAcceptSuccess) {
			toast.success('Вы присоединились к группе!');
			const groupId = inviteStore.acceptedGroupId;
			if (groupId) {
				await goto(ROUTES.GROUP_DETAIL(groupId));
			}
		} else if (!inviteStore.isAlreadyMember) {
			toast.error(inviteStore.acceptError ?? 'Ошибка');
		}
	};
</script>

<svelte:head>
	<title>Приглашение в группу · Movies App</title>
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

	{#if inviteStore.isLoading}
		<div class="invite-loading">
			<Spinner size="lg" />
		</div>
	{:else if inviteStore.isTokenNotFound}
		<Card variant="outlined" size="responsive" class="form-card">
			{#snippet header()}
				<div class="form-card-header">
					<div class="invite-error-icon">
						<AlertCircle size={40} />
					</div>
					<h2 class="form-card-title">Приглашение не найдено</h2>
					<p class="form-card-subtitle">Ссылка недействительна или была удалена</p>
				</div>
			{/snippet}

			<div class="invite-actions">
				<Button variant="primary" fullWidth href={ROUTES.HOME}>На главную</Button>
			</div>
		</Card>
	{:else if showGroupInfo}
		<Card variant="outlined" size="responsive" class="form-card">
			{#snippet header()}
				<div class="form-card-header">
					<h2 class="form-card-title">Приглашение в группу</h2>
					<p class="form-card-subtitle">Вас приглашают присоединиться</p>
				</div>
			{/snippet}

			<div class="invite-group-info">
				<Avatar
					src={inviteStore.inviteInfo?.avatarUrl}
					name={inviteStore.inviteInfo?.name}
					size="lg"
				/>
				<div class="invite-group-details">
					<h3 class="invite-group-name">{inviteStore.inviteInfo?.name}</h3>
					{#if inviteStore.inviteInfo?.description}
						<p class="invite-group-desc">{inviteStore.inviteInfo.description}</p>
					{/if}
					<span class="invite-member-count">
						<Users size={14} />
						{inviteStore.inviteInfo?.memberCount ?? 0} участников
					</span>
				</div>
			</div>

			{#if inviteStore.isAlreadyMember}
				<div class="invite-status">
					<p class="invite-status-text">Вы уже участник этой группы</p>
					<Button
						variant="primary"
						fullWidth
						href={inviteStore.inviteInfo?.id
							? ROUTES.GROUP_DETAIL(inviteStore.inviteInfo.id)
							: undefined}
					>
						Перейти в группу
					</Button>
				</div>
			{:else if isNotLoggedIn}
				<div class="invite-actions">
					<Button variant="primary" fullWidth onclick={handleLogin}>
						<LogIn size={18} />
						Войти, чтобы присоединиться
					</Button>
				</div>
			{:else if inviteStore.isAcceptSuccess}
				<div class="invite-status">
					<p class="invite-status-text invite-status-success">Вы присоединились!</p>
					<Button
						variant="primary"
						fullWidth
						href={inviteStore.acceptedGroupId
							? ROUTES.GROUP_DETAIL(inviteStore.acceptedGroupId)
							: undefined}
					>
						Перейти в группу
					</Button>
				</div>
			{:else}
				<div class="invite-actions">
					<Button
						variant="primary"
						fullWidth
						loading={inviteStore.isAccepting}
						onclick={handleAccept}
					>
						Присоединиться
					</Button>
				</div>
			{/if}
		</Card>
	{:else if inviteStore.isError}
		<Card variant="outlined" size="responsive" class="form-card">
			{#snippet header()}
				<div class="form-card-header">
					<h2 class="form-card-title">Ошибка</h2>
					<p class="form-card-subtitle">{inviteStore.error}</p>
				</div>
			{/snippet}

			<div class="invite-actions">
				<Button
					variant="primary"
					fullWidth
					onclick={() => token && inviteStore.fetchInviteInfo(token)}>Повторить</Button
				>
			</div>
		</Card>
	{/if}
</div>

<style>
	.invite-loading {
		display: flex;
		justify-content: center;
		padding: var(--space-8, 2rem) 0;
	}

	.invite-error-icon {
		color: var(--color-error, #e5484d);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.invite-group-info {
		display: flex;
		align-items: center;
		gap: var(--space-4, 1rem);
		padding: var(--space-3, 0.75rem) 0;
	}

	.invite-group-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-1, 0.25rem);
		min-width: 0;
	}

	.invite-group-name {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.invite-group-desc {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #888);
		margin: 0;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.invite-member-count {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
		font-size: var(--text-xs, 0.75rem);
		color: var(--text-secondary, #888);
	}

	.invite-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
		padding-top: var(--space-2, 0.5rem);
	}

	.invite-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3, 0.75rem);
		padding: var(--space-3, 0.75rem) 0;
	}

	.invite-status-text {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #888);
		margin: 0;
	}

	.invite-status-success {
		color: var(--color-success, #30a46c);
		font-weight: 600;
	}
</style>
