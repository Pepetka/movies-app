<script lang="ts">
	import { toast } from '@repo/ui';

	import {
		groupMovieStore,
		MovieForm,
		EMPTY_CUSTOM_MOVIE_FORM,
		customMovieFormToCreateDto,
		type CustomMovieFormData
	} from '$lib/modules/movies';
	import { groupStore } from '$lib/modules/groups';
	import { topBarStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));

	let form = $state<CustomMovieFormData>({ ...EMPTY_CUSTOM_MOVIE_FORM });
	let hasRedirected = $state(false);

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

	$effect(() => {
		if (!groupStore.isModerator && !hasRedirected) {
			hasRedirected = true;
			toast.error('Добавление фильмов доступно только модераторам');
			void goto(ROUTES.GROUP_DETAIL(groupId));
		}
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
