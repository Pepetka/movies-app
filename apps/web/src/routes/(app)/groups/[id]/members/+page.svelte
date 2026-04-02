<script lang="ts">
	import { Avatar, Badge, Button, Card, IconButton, Input, Modal, Spinner, toast } from '@repo/ui';
	import { Check, Copy, MoreVertical, RefreshCw } from '@lucide/svelte';

	import { groupStore, inviteStore, membersStore } from '$lib/modules/groups';
	import type { GroupMemberResponseDtoRole } from '$lib/api/generated/types';
	import { authStore } from '$lib/modules/auth';
	import { topBarStore } from '$lib/stores';
	import { PagePlaceholder } from '$lib/ui';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	const isLoading = $derived(membersStore.isLoading);
	const isInviteLoading = $derived(inviteStore.isGenerating || inviteStore.isTokenLoading);

	const inviteLink = $derived.by(() => {
		const token = inviteStore.inviteToken;
		if (!token) return '';
		return `${page.url.origin}/invite/${token}`;
	});

	let showConfirmRegenerate = $state(false);
	let isCopied = $state(false);
	let copyTimeoutId: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		topBarStore.configure({
			title: 'Участники',
			showBack: true,
			onBack: () => goto(ROUTES.GROUP_DETAIL(groupId))
		});
		return () => {
			topBarStore.destroy();
			if (copyTimeoutId) clearTimeout(copyTimeoutId);
			isCopied = false;
		};
	});

	$effect(() => {
		if (groupId) {
			void membersStore.fetchMembers(groupId);
		}
	});

	$effect(() => {
		if (groupId && groupStore.isLoaded && groupStore.isModerator) {
			void inviteStore.fetchInviteToken(groupId);
		}
		return () => {
			inviteStore.reset();
			inviteStore.resetForm();
		};
	});

	$effect(() => {
		if (membersStore.isForbidden) {
			void goto(ROUTES.GROUPS);
		}
	});

	const roleBadgeVariant = (role: GroupMemberResponseDtoRole) => {
		if (role === 'admin') return 'warning';
		if (role === 'moderator') return 'primary';
		return 'default';
	};

	const roleLabel = (role: GroupMemberResponseDtoRole) => {
		if (role === 'admin') return 'Админ';
		if (role === 'moderator') return 'Модератор';
		return 'Участник';
	};

	const canManageMember = (memberRole: GroupMemberResponseDtoRole): boolean => {
		const myRole = groupStore.currentUserRole;
		if (!myRole) return false;
		if (myRole === 'admin') return memberRole !== 'admin';
		if (myRole === 'moderator') return memberRole === 'member';
		return false;
	};

	const handleManageMember = (_userId: number) => {
		// TODO: implement member management menu
	};

	const handleGenerateInvite = () => {
		if (isInviteLoading) return;
		if (inviteStore.inviteToken) {
			showConfirmRegenerate = true;
		} else {
			void inviteStore.generateInvite(groupId);
		}
	};

	const confirmRegenerate = async () => {
		showConfirmRegenerate = false;
		await inviteStore.generateInvite(groupId);
		if (inviteStore.isGenerateSuccess) {
			toast.success('Ссылка пересоздана');
		} else {
			toast.error(inviteStore.generateError ?? 'Ошибка');
		}
	};

	const handleCopyLink = async () => {
		if (!inviteLink || isCopied) return;
		try {
			await navigator.clipboard.writeText(inviteLink);
			isCopied = true;
			if (copyTimeoutId) clearTimeout(copyTimeoutId);
			copyTimeoutId = setTimeout(() => (isCopied = false), 3000);
		} catch {
			toast.error('Не удалось скопировать ссылку');
		}
	};
</script>

<svelte:head>
	<title>Участники · {groupStore.currentGroup?.name ?? 'Группа'} · Movies App</title>
</svelte:head>

{#if isLoading}
	<div class="loading-state">
		<Spinner size="lg" />
	</div>
{:else if membersStore.isError}
	<PagePlaceholder title="Ошибка" hint={membersStore.error ?? 'Не удалось загрузить участников'} />
{:else}
	<div class="members-page">
		{#if groupStore.isModerator}
			<Card variant="outlined" size="sm">
				{#snippet header()}
					<h2 class="invite-section__title">Приглашение</h2>
				{/snippet}
				<div class="invite-section__link">
					<Input
						label="Ссылка для приглашения"
						value={inviteLink}
						readonly
						hideMessage
						Icon={isCopied ? Check : Copy}
						iconLabel={isCopied ? 'Скопировано' : 'Скопировать'}
						iconAction={handleCopyLink}
						disabled={isInviteLoading || !inviteLink}
					/>
					<IconButton
						variant="ghost"
						Icon={RefreshCw}
						label="Пересоздать"
						onclick={handleGenerateInvite}
						loading={isInviteLoading}
					/>
				</div>
				{#if inviteStore.generateError}
					<p class="invite-section__error">{inviteStore.generateError}</p>
				{/if}
			</Card>
		{/if}

		<ul class="members-list">
			{#each membersStore.members as member (member.userId)}
				{@const user = member.user}
				{@const isCurrentUser = member.userId === authStore.user?.id}
				<li class="member-item">
					<Avatar name={user.name} size="md" />
					<div class="member-item__info">
						<span class="member-item__name">
							{user.name}
							{#if isCurrentUser}
								<span class="member-item__you">(вы)</span>
							{/if}
						</span>
					</div>
					<Badge variant={roleBadgeVariant(member.role)} size="sm">
						{roleLabel(member.role)}
					</Badge>
					{#if canManageMember(member.role)}
						<IconButton
							Icon={MoreVertical}
							variant="ghost"
							label="Управление"
							onclick={() => handleManageMember(member.userId)}
						/>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<Modal open={showConfirmRegenerate} size="sm" onClose={() => (showConfirmRegenerate = false)}>
	{#snippet header(_close)}
		<h3>Пересоздать ссылку?</h3>
	{/snippet}
	<p>Старая ссылка перестанет работать.</p>
	{#snippet footer(close)}
		<Button variant="ghost" onclick={close}>Отмена</Button>
		<Button onclick={confirmRegenerate}>Пересоздать</Button>
	{/snippet}
</Modal>

<style>
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.members-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding-block: var(--space-4);
	}

	.invite-section__title {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
		text-align: start;
	}

	.invite-section__link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.invite-section__error {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-error);
	}

	.members-list {
		display: flex;
		flex-direction: column;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: var(--space-2);
	}

	.member-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		background-color: var(--bg-primary);
		border: var(--border-width-thin) solid var(--border-primary);
	}

	.member-item__info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-0_5);
	}

	.member-item__name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.member-item__you {
		color: var(--text-secondary);
		font-weight: var(--font-normal);
	}
</style>
