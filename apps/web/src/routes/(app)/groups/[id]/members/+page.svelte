<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		Card,
		Dropdown,
		IconButton,
		Input,
		List,
		ListItem,
		Sheet,
		Spinner,
		toast
	} from '@repo/ui';
	import { Check, Copy, MoreVertical, RefreshCw } from '@lucide/svelte';

	import { groupStore, inviteStore, membersStore } from '$lib/modules/groups';
	import type { GroupMemberResponseDto } from '$lib/api/generated/types';
	import { authStore } from '$lib/modules/auth';
	import { goBack, ROUTES } from '$lib/utils';
	import { topBarStore } from '$lib/stores';
	import { PagePlaceholder } from '$lib/ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { CONFIRM_TEXT, ROLE_BADGE_VARIANT, ROLE_LABEL } from './constants';
	import { canManageMember, getDropdownItems } from './helpers';
	import type { ConfirmAction } from './constants';

	const groupId = $derived(Number(page.params.id));

	const isLoading = $derived(membersStore.isLoading);
	const isInviteLoading = $derived(inviteStore.isGenerating || inviteStore.isTokenFetching);
	const isMutating = $derived(
		membersStore.isRemoving || membersStore.isUpdatingRole || membersStore.isTransferring
	);

	const inviteLink = $derived.by(() => {
		const token = inviteStore.inviteToken;
		if (!token) return '';
		return `${page.url.origin}/invite/${token}`;
	});

	let pendingAction = $state<{
		type: ConfirmAction;
		userId: number;
		userName: string;
	} | null>(null);

	let showConfirmAction = $state(false);

	let showConfirmRegenerate = $state(false);
	let isCopied = $state(false);
	let copyTimeoutId: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		topBarStore.configure({
			title: 'Участники',
			showBack: true,
			onBack: () => goBack(ROUTES.GROUP_DETAIL(groupId))
		});
		return () => {
			topBarStore.destroy();
		};
	});

	$effect(() => {
		return () => {
			if (copyTimeoutId) clearTimeout(copyTimeoutId);
			isCopied = false;
		};
	});

	$effect(() => {
		if (groupId) {
			void membersStore.fetchMembers(groupId);
		}
		return () => {
			membersStore.resetMutations();
		};
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

	const canManageMemberLocal = (memberRole: GroupMemberResponseDto['role']) =>
		canManageMember(memberRole, groupStore.currentUserRole);

	const getDropdownItemsLocal = (member: GroupMemberResponseDto) =>
		getDropdownItems(member, groupStore.currentUserRole);

	const handleAction = (type: ConfirmAction, member: GroupMemberResponseDto) => {
		pendingAction = { type, userId: member.userId, userName: member.user.name };
		showConfirmAction = true;
	};

	const ACTION_HANDLERS: Record<
		ConfirmAction,
		{
			execute: (groupId: number, userId: number) => Promise<void>;
			isSuccess: () => boolean;
			error: () => string | null;
		}
	> = {
		remove: {
			execute: (gid, uid) => membersStore.removeMember(gid, uid),
			isSuccess: () => membersStore.isRemoveSuccess,
			error: () => membersStore.removeError
		},
		'make-moderator': {
			execute: (gid, uid) => membersStore.updateMemberRole(gid, uid, 'moderator'),
			isSuccess: () => membersStore.isUpdateRoleSuccess,
			error: () => membersStore.updateRoleError
		},
		'demote-moderator': {
			execute: (gid, uid) => membersStore.updateMemberRole(gid, uid, 'member'),
			isSuccess: () => membersStore.isUpdateRoleSuccess,
			error: () => membersStore.updateRoleError
		},
		'transfer-ownership': {
			execute: (gid, uid) => membersStore.transferOwnership(gid, uid),
			isSuccess: () => membersStore.isTransferSuccess,
			error: () => membersStore.transferError
		}
	};

	const confirmAction = async () => {
		if (!pendingAction || isMutating) return;

		const { type, userId } = pendingAction;
		const config = CONFIRM_TEXT[type];
		const handler = ACTION_HANDLERS[type];

		await handler.execute(groupId, userId);

		if (handler.isSuccess()) {
			toast.success(config.successMessage);
			showConfirmAction = false;
		} else {
			toast.error(handler.error() ?? config.errorFallback);
		}
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

		<ul class="members-list" aria-label="Список участников группы">
			{#each membersStore.members as member (member.userId)}
				{@const user = member.user}
				{@const isCurrentUser = member.userId === authStore.user?.id}
				<li class="member-item">
					<Avatar name={user.name} size="md" />
					<div class="member-item__info">
						<span class="member-item__name">
							<span class="member-item__name-text">{user.name}</span>
							{#if isCurrentUser}
								<span class="member-item__you">(вы)</span>
							{/if}
						</span>
					</div>
					<Badge variant={ROLE_BADGE_VARIANT[member.role]} size="sm">
						{ROLE_LABEL[member.role]}
					</Badge>
					{#if canManageMemberLocal(member.role)}
						<Dropdown position="bottom-end">
							<IconButton Icon={MoreVertical} variant="ghost" label="Управление" />
							{#snippet items()}
								<List variant="plain" style="white-space: nowrap;">
									{#each getDropdownItemsLocal(member) as item (item.type)}
										<ListItem
											title={item.label}
											interactive
											size="sm"
											onclick={() => handleAction(item.type, member)}
										/>
									{/each}
								</List>
							{/snippet}
						</Dropdown>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<Sheet bind:open={showConfirmAction} size="sm">
	{#snippet header()}
		{#if pendingAction}
			<h3>{CONFIRM_TEXT[pendingAction.type].title}</h3>
		{/if}
	{/snippet}
	{#if pendingAction}
		<p>{CONFIRM_TEXT[pendingAction.type].getDescription(pendingAction.userName)}</p>
	{/if}
	{#snippet footer(close)}
		<Button variant="ghost" onclick={close}>Отмена</Button>
		{#if pendingAction}
			{@const confirm = CONFIRM_TEXT[pendingAction.type]}
			<Button variant={confirm.variant} onclick={confirmAction} loading={isMutating}>
				{confirm.button}
			</Button>
		{/if}
	{/snippet}
</Sheet>

<Sheet bind:open={showConfirmRegenerate} size="sm">
	{#snippet header()}
		<h3>Пересоздать ссылку?</h3>
	{/snippet}
	<p>Старая ссылка перестанет работать.</p>
	{#snippet footer(close)}
		<Button variant="ghost" onclick={close}>Отмена</Button>
		<Button onclick={confirmRegenerate}>Пересоздать</Button>
	{/snippet}
</Sheet>

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
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		min-width: 0;
	}

	.member-item__name-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.member-item__you {
		color: var(--text-secondary);
		font-weight: var(--font-normal);
		flex-shrink: 0;
	}
</style>
