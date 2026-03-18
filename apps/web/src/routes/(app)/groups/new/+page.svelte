<script lang="ts">
	import { toast } from '@repo/ui';

	import {
		GroupForm,
		groupStore,
		EMPTY_GROUP_FORM,
		groupFormToCreateDto,
		type GroupFormData
	} from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

	$effect(() => {
		topBarStore.configure({
			title: 'Новая группа',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUPS))
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
			await goto(resolve(ROUTES.GROUP_DETAIL(groupStore.createdGroup.id)));
		} else {
			toast.error(groupStore.createError ?? 'Не удалось создать группу');
		}
	};
</script>

<GroupForm mode="create" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isCreating} />
