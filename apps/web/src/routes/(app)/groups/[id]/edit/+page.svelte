<script lang="ts">
	import { Spinner, toast } from '@repo/ui';
	import { untrack } from 'svelte';

	import { GroupForm, groupStore, EMPTY_GROUP_FORM, type GroupFormData } from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	import '$lib/styles/page-states.css';

	const groupId = $derived(Number(page.params.id));

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });
	let isFormInitialized = $state(false);

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUP_DETAIL(groupId)))
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		untrack(() => {
			void groupStore.fetchGroup(groupId);
		});

		return () => {
			groupStore.resetForm();
			isFormInitialized = false;
		};
	});

	$effect(() => {
		if (groupStore.currentGroup && !groupStore.updateError && !isFormInitialized) {
			form = {
				name: groupStore.currentGroup.name ?? '',
				description: groupStore.currentGroup.description ?? '',
				avatarUrl: groupStore.currentGroup.avatarUrl ?? ''
			};
			isFormInitialized = true;
		}
	});

	const handleSubmit = async () => {
		const group = await groupStore.updateGroup(groupId, {
			name: form.name,
			description: form.description || undefined,
			avatarUrl: form.avatarUrl || undefined
		});

		if (group) {
			toast.success('Группа обновлена');
			await goto(resolve(ROUTES.GROUP_DETAIL(group.id)));
		} else if (groupStore.updateError) {
			toast.error(groupStore.updateError);
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
