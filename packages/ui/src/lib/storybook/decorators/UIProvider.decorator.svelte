<script lang="ts">
	import type { Snippet } from 'svelte';
	import { UIProvider } from '$lib';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();
</script>

<UIProvider />
{@render children()}
