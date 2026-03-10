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

	import '$lib/styles/page-states.css';

	const groupId = $derived(Number(page.params.id));

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });
	let loadError = $state<string | null>(null);

	$effect(() => {
		topBarStore.configure({
			title: 'Редактирование',
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUP_DETAIL(groupId)))
		});
		return () => topBarStore.destroy();
	});

	$effect(() => {
		let cancelled = false;

		const loadGroup = async () => {
			groupsStore.resetForm();
			loadError = null;

			await groupsStore.fetchGroup(groupId);

			if (cancelled) return;

			if (groupsStore.formError) {
				loadError = groupsStore.formError;
			} else if (groupsStore.currentGroup) {
				form = {
					name: groupsStore.currentGroup.name ?? '',
					description: groupsStore.currentGroup.description ?? '',
					avatarUrl: groupsStore.currentGroup.avatarUrl ?? ''
				};
			}
		};

		void loadGroup();

		return () => {
			cancelled = true;
			groupsStore.resetForm();
		};
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

	const handleRetry = () => {
		void groupsStore.fetchGroup(groupId);
	};

	const isLoading = $derived(groupsStore.currentGroup?.id !== groupId && !loadError);
</script>

{#if isLoading}
	<div class="page-state">
		<Spinner size="lg" />
	</div>
{:else if loadError}
	<div class="page-state">
		<p class="page-state__error-message">{loadError}</p>
		<button class="page-state__retry-button" onclick={handleRetry}>Повторить</button>
	</div>
{:else}
	<GroupForm
		mode="edit"
		bind:form
		onSubmit={handleSubmit}
		isSubmitting={groupsStore.isSubmitting}
	/>
{/if}
