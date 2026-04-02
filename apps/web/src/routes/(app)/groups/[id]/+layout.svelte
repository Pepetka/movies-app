<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Spinner } from '@repo/ui';

	import { groupStore } from '$lib/modules/groups';
	import { PagePlaceholder } from '$lib/ui';
	import { goto } from '$app/navigation';
	import { ROUTES } from '$lib/utils';
	import { page } from '$app/state';

	const { children }: { children: Snippet } = $props();
	const groupId = $derived(Number(page.params.id));

	$effect(() => {
		if (groupId) {
			void groupStore.fetchGroup(groupId);
		}
	});

	$effect(() => {
		if (groupStore.isForbidden) {
			void goto(ROUTES.GROUPS);
		}
	});
</script>

{#if groupStore.isLoading}
	<div class="loading-state">
		<Spinner size="lg" />
	</div>
{:else if groupStore.isError}
	<PagePlaceholder title="Ошибка" hint={groupStore.error ?? 'Не удалось загрузить группу'} />
{:else if groupStore.currentGroup}
	{@render children()}
{:else}
	<PagePlaceholder title="Группа не найдена" hint="Возможно, она была удалена" />
{/if}

<style>
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}
</style>
