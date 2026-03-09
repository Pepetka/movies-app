<script lang="ts">
	import { Pencil } from '@lucide/svelte';

	import { PagePlaceholder } from '$lib/ui';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	$effect(() => {
		topBarStore.configure({
			title: `Группа ${groupId}`,
			showBack: true,
			onBack: () => goto(resolve(ROUTES.GROUPS)),
			trailingAction: {
				Icon: Pencil,
				label: 'Редактировать',
				onclick: () => goto(resolve(ROUTES.GROUP_EDIT(groupId)))
			}
		});
		return () => topBarStore.destroy();
	});
</script>

<PagePlaceholder title="Страница группы #{groupId}" hint="TODO: реализовать детали группы" />
