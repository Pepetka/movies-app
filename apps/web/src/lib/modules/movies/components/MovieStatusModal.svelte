<script lang="ts">
	import { Button, DatePicker, Divider, Sheet, Select, toast } from '@repo/ui';
	import { untrack } from 'svelte';

	import { createFormFieldValidator } from '$lib/utils/validation.svelte';

	import {
		EMPTY_STATUS_FORM,
		MOVIE_STATUS_OPTIONS,
		movieStatusFormFromEntity,
		movieStatusFormToUpdateDto,
		validateMovieStatusForm,
		type MovieStatusFormData
	} from '../validation/movie-status.validation.svelte';
	import type { UnifiedMovie } from '../types';
	import { groupMovieStore } from '../stores';

	let {
		open = $bindable(false),
		movie,
		groupId,
		movieId,
		onSuccess
	}: {
		open?: boolean;
		movie: UnifiedMovie | null;
		groupId: number;
		movieId: number;
		onSuccess?: () => void;
	} = $props();

	let form = $state<MovieStatusFormData>({ ...EMPTY_STATUS_FORM });
	const fieldValidator = createFormFieldValidator(validateMovieStatusForm);

	$effect(() => {
		if (open && movie) {
			untrack(() => {
				form = movieStatusFormFromEntity(movie);
			});
		}
		return () => {
			fieldValidator.reset();
			groupMovieStore.resetUpdate();
		};
	});

	const handleStatusChange = () => {
		if (form.status === 'tracking') form.watchDate = null;
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (groupMovieStore.isUpdating) return;

		const validation = validateMovieStatusForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;

		await groupMovieStore.updateMovie(groupId, movieId, movieStatusFormToUpdateDto(form));

		if (groupMovieStore.isUpdateSuccess) {
			toast.success('Статус обновлен');
			open = false;
			onSuccess?.();
		} else {
			toast.error(groupMovieStore.updateError ?? 'Ошибка обновления');
		}
	};
</script>

<Sheet bind:open size="sm">
	{#snippet header()}
		<h2>Изменить статус</h2>
	{/snippet}
	{#snippet drawerHeader()}
		<h2>Изменить статус</h2>
	{/snippet}

	<form class="status-form" onsubmit={handleSubmit}>
		<div class="status-form__body">
			<Select
				label="Статус"
				options={MOVIE_STATUS_OPTIONS}
				bind:value={form.status}
				error={fieldValidator.errors.status}
				disabled={groupMovieStore.isUpdating}
				onChange={() => {
					handleStatusChange();
					fieldValidator.handleFieldChange(form, 'status');
				}}
			/>

			{#if form.status === 'planned' || form.status === 'watched'}
				<Divider label="Дата просмотра" class="status-form__divider" />

				<DatePicker
					label="Дата просмотра"
					bind:value={form.watchDate}
					error={fieldValidator.errors.watchDate}
					disabled={groupMovieStore.isUpdating}
					clearable
					onChange={() => fieldValidator.handleFieldChange(form, 'watchDate')}
					inline
				/>
			{/if}
		</div>

		<div class="status-form__actions">
			<Button
				variant="secondary"
				onclick={() => (open = false)}
				disabled={groupMovieStore.isUpdating}
			>
				Отмена
			</Button>
			<Button type="submit" variant="primary" loading={groupMovieStore.isUpdating}>
				Сохранить
			</Button>
		</div>
	</form>
</Sheet>

<style>
	.status-form {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	h2 {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
	}

	.status-form__body {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-grow: 1;
		gap: var(--space-1);
	}

	:global(.status-form__divider) {
		width: 100%;
		margin-bottom: var(--space-3);
	}

	.status-form__actions {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
