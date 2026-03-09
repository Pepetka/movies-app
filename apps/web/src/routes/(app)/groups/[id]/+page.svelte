<script lang="ts">
	import { PagePlaceholder } from '$lib/ui';
	import { topBarStore } from '$lib/stores';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(page.params.id);

	$effect(() => {
		topBarStore.configure({
			title: `Группа ${groupId}`
		});
		return () => topBarStore.destroy();
	});
</script>

<PagePlaceholder
	title="Страница группы #{groupId}"
	hint="TODO: реализовать детали группы"
	backTo={resolve(ROUTES.GROUPS)}
	backLabel="Назад к группам"
/>
