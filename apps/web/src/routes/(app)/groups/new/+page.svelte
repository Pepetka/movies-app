<script lang="ts">
	import { toast } from '@repo/ui';

	import {
		GroupForm,
		groupStore,
		EMPTY_GROUP_FORM,
		groupFormToCreateDto,
		type GroupFormData
	} from '$lib/modules/groups';
	import { goBack, ROUTES } from '$lib/utils';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

	$effect(() => {
		topBarStore.configure({
			title: 'Новая группа',
			showBack: true,
			onBack: () => goBack(ROUTES.GROUPS)
		});

		return () => {
			topBarStore.destroy();
			groupStore.resetForm();
		};
	});

	const handleSubmit = async () => {
		await groupStore.createGroup(groupFormToCreateDto(form));

		if (groupStore.isCreateSuccess && groupStore.createdGroup) {
			toast.success('Группа создана');
			await goto(ROUTES.GROUP_DETAIL(groupStore.createdGroup.id));
		} else {
			toast.error(groupStore.createError ?? 'Не удалось создать группу');
		}
	};
</script>

<svelte:head>
	<title>Новая группа · Movies App</title>
</svelte:head>

<GroupForm mode="create" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isCreating} />
