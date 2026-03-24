<script lang="ts">
	import { Spinner, toast } from '@repo/ui';

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
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	import '$lib/styles/page-states.css';

	const groupId = $derived(Number(page.params.id));

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUP_DETAIL(groupId)))
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		if (groupId) {
			void groupStore.fetchGroup(groupId);
		}

		return () => {
			groupStore.resetForm();
		};
	});

	$effect(() => {
		if (groupStore.isLoaded && groupStore.currentGroup?.id === groupId) {
			form = groupFormFromEntity(groupStore.currentGroup);
		}
	});

	$effect(() => {
		if (groupStore.isLoaded && groupStore.currentGroup?.id === groupId && !groupStore.isModerator) {
			toast.error('Редактирование доступно только модераторам');
			void goto(resolve(ROUTES.GROUP_DETAIL(groupId)));
		}
	});

	const handleSubmit = async () => {
		await groupStore.updateGroup(groupId, groupFormToUpdateDto(form));

		if (groupStore.isUpdateSuccess) {
			toast.success('Группа обновлена');
			await goto(resolve(ROUTES.GROUP_DETAIL(groupId)));
		} else {
			toast.error(groupStore.updateError ?? 'Ошибка обновления');
		}
	};

	const handleRetry = () => {
		void groupStore.fetchGroup(groupId);
	};
</script>

{#if groupStore.isLoading}
	<div class="page-state">
		<Spinner size="lg" />
	</div>
{:else if groupStore.isError}
	<div class="page-state">
		<p class="page-state__error-message">{groupStore.error}</p>
		<button class="page-state__retry-button" onclick={handleRetry}>Повторить</button>
	</div>
{:else}
	<GroupForm mode="edit" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isUpdating} />
{/if}
