<script lang="ts">
	import { PagePlaceholder } from '$lib/ui';
	import { topBarStore } from '$lib/stores';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	$effect(() => {
		topBarStore.configure({
			title: 'Новая группа'
		});
		return () => topBarStore.reset();
	});
</script>

<PagePlaceholder
	title="Страница создания группы"
	hint="TODO: реализовать форму создания"
	backTo={resolve(ROUTES.GROUPS)}
	backLabel="Назад к группам"
/>
