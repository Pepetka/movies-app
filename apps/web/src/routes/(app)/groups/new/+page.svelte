<script lang="ts">
	import { toast } from '@repo/ui';

	import { GroupForm, groupStore, EMPTY_GROUP_FORM, type GroupFormData } from '$lib/modules/groups';
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
		const group = await groupStore.createGroup({
			name: form.name,
			description: form.description || undefined,
			avatarUrl: form.avatarUrl || undefined
		});

		if (group) {
			toast.success('Группа создана');
			await goto(resolve(ROUTES.GROUP_DETAIL(group.id)));
		} else {
			toast.error(groupStore.createError ?? 'Не удалось создать группу');
		}
	};
</script>

<GroupForm mode="create" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isCreating} />
