<script lang="ts">
	import { toast } from '@repo/ui';
	import { untrack } from 'svelte';

	import {
		GroupForm,
		groupStore,
		EMPTY_GROUP_FORM,
		groupFormToUpdateDto,
		groupFormFromEntity,
		type GroupFormData
	} from '$lib/modules/groups';
	import { goBack, ROUTES } from '$lib/utils';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });
	let hasRedirected = $state(false);
	let isFormInitialized = $state(false);

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goBack(ROUTES.GROUP_DETAIL(groupId))
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
		if (groupStore.currentGroup && !groupStore.updateError && !isFormInitialized) {
			untrack(() => {
				form = groupFormFromEntity(groupStore.currentGroup!);
				isFormInitialized = true;
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
</script>

<svelte:head>
	<title>Редактирование группы · Movies App</title>
</svelte:head>

<div class="edit-page">
	<GroupForm mode="edit" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isUpdating} />
</div>

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
