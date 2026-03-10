<script lang="ts">
	import { Spinner, toast } from '@repo/ui';

	import {
		GroupForm,
		groupsStore,
		EMPTY_GROUP_FORM,
		type GroupFormData
	} from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });
	let isLoadingGroup = $state(false);

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUP_DETAIL(groupId)))
		});
		return () => {
			topBarStore.destroy();
		};
	});

	$effect(() => {
		if (groupsStore.currentGroup?.id !== groupId && !isLoadingGroup) {
			isLoadingGroup = true;
			groupsStore.resetForm();
			void groupsStore.fetchGroup(groupId).finally(() => {
				isLoadingGroup = false;
			});
		}
	});

	$effect(() => {
		const current = groupsStore.currentGroup;
		if (current?.id === groupId) {
			form = {
				name: current.name ?? '',
				description: current.description ?? '',
				avatarUrl: current.avatarUrl ?? ''
			};
		}
	});

	const handleSubmit = async () => {
		const group = await groupsStore.updateGroup(groupId, {
			name: form.name,
			description: form.description || undefined,
			avatarUrl: form.avatarUrl || undefined
		});

		if (group) {
			toast.success('Группа обновлена');
			await goto(resolve(ROUTES.GROUP_DETAIL(group.id)));
		} else if (groupsStore.formError) {
			toast.error(groupsStore.formError);
		}
	};

	const isLoading = $derived(isLoadingGroup || groupsStore.currentGroup?.id !== groupId);
</script>

{#if isLoading}
	<div class="group-form-page">
		<div class="group-form-loading">
			<Spinner size="lg" />
		</div>
	</div>
{:else}
	<GroupForm mode="edit" bind:form onSubmit={handleSubmit} />
{/if}

<style>
	.group-form-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		padding-top: var(--space-16);
	}
</style>
