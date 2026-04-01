<script lang="ts">
	import { toast } from '@repo/ui';

	import {
		groupMovieStore,
		MovieForm,
		EMPTY_CUSTOM_MOVIE_FORM,
		customMovieFormToCreateDto,
		type CustomMovieFormData
	} from '$lib/modules/movies';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let form = $state<CustomMovieFormData>({ ...EMPTY_CUSTOM_MOVIE_FORM });

	$effect(() => {
		topBarStore.configure({
			title: 'Новый фильм',
			showBack: true,
			onBack: () => goto(ROUTES.GROUP_MOVIES_SEARCH(groupId))
		});
		return () => {
			topBarStore.destroy();
			groupMovieStore.resetCreate();
		};
	});

	const handleSubmit = async () => {
		await groupMovieStore.createMovie(groupId, customMovieFormToCreateDto(form));

		if (groupMovieStore.isCreateSuccess) {
			toast.success('Фильм создан');
			await goto(ROUTES.GROUP_DETAIL(groupId));
		} else {
			toast.error(groupMovieStore.createError ?? 'Не удалось создать фильм');
		}
	};
</script>

<svelte:head>
	<title>Новый фильм · Movies App</title>
</svelte:head>

<MovieForm
	mode="create"
	bind:form
	onSubmit={handleSubmit}
	isSubmitting={groupMovieStore.isCreating}
/>
