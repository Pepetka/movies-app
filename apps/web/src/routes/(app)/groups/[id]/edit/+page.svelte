<script lang="ts">
	import { Button, Modal, toast } from '@repo/ui';
	import { Trash2 } from '@lucide/svelte';
	import { untrack } from 'svelte';

	import {
		GroupForm,
		groupStore,
		EMPTY_GROUP_FORM,
		groupFormToUpdateDto,
		groupFormFromEntity,
		type GroupFormData
	} from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });
	let showDeleteModal = $state(false);
	let hasRedirected = $state(false);

	const openDeleteModal = () => {
		showDeleteModal = true;
	};

	const closeDeleteModal = () => {
		showDeleteModal = false;
		groupStore.resetDelete();
	};

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goto(ROUTES.GROUP_DETAIL(groupId)),
			trailingAction: groupStore.isAdmin
				? {
						Icon: Trash2,
						label: 'Удалить группу',
						onclick: openDeleteModal
					}
				: undefined
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		return () => {
			groupStore.resetForm();
		};
	});

	$effect(() => {
		if (groupStore.isLoaded && !groupStore.isModerator && !hasRedirected) {
			hasRedirected = true;
			toast.error('Редактирование доступно только модераторам');
			void goto(ROUTES.GROUP_DETAIL(groupId));
		}
	});

	$effect(() => {
		if (groupStore.currentGroup) {
			untrack(() => {
				form = groupFormFromEntity(groupStore.currentGroup!);
			});
		}
	});

	const handleSubmit = async () => {
		await groupStore.updateGroup(groupId, groupFormToUpdateDto(form));

		if (groupStore.isUpdateSuccess) {
			toast.success('Группа обновлена');
			await goto(ROUTES.GROUP_DETAIL(groupId));
		} else {
			toast.error(groupStore.updateError ?? 'Ошибка обновления');
		}
	};

	const handleDelete = async () => {
		await groupStore.deleteGroup(groupId);

		if (groupStore.isDeleteSuccess) {
			toast.success('Группа удалена');
			await goto(ROUTES.GROUPS);
		} else {
			toast.error(groupStore.deleteError ?? 'Ошибка удаления');
		}
	};
</script>

<svelte:head>
	<title>Редактирование группы · Movies App</title>
</svelte:head>

<div class="edit-page">
	<GroupForm mode="edit" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isUpdating} />
</div>

<Modal bind:open={showDeleteModal} size="sm">
	{#snippet header()}
		<h2>Удалить группу?</h2>
	{/snippet}

	<p class="modal-text">
		Вы уверены, что хотите удалить группу "{groupStore.currentGroup?.name}"? Это действие нельзя
		отменить.
	</p>

	{#snippet footer()}
		<Button variant="secondary" onclick={closeDeleteModal} disabled={groupStore.isDeleting}>
			Отмена
		</Button>
		<Button variant="danger" onclick={handleDelete} loading={groupStore.isDeleting}>Удалить</Button>
	{/snippet}
</Modal>

<style>
	.edit-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding-block: var(--space-4);
		align-items: center;
	}

	@media (min-width: 480px) {
		.edit-page {
			padding: var(--space-6) var(--space-6) var(--space-10);
		}
	}
</style>
