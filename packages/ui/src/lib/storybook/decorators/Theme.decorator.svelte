<script lang="ts">
	import type { Snippet } from 'svelte';

	import { themeStore, type Theme } from '$lib/stores/theme.store.svelte';

	interface IProps {
		children: Snippet;
		theme: Theme;
	}

	const { children, theme }: IProps = $props();

	$effect(() => {
		themeStore.setTheme(theme);
	});
</script>

<div class="root">
	{@render children()}
</div>

<style>
	.root {
		min-height: 100vh;
		width: calc(100vw - 8px);
		padding: 20px;
		transform: scale(1);
	}
</style>
