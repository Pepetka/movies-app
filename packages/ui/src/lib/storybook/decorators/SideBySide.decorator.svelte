<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();
</script>

<div class="side-by-side">
	<div class="root" data-theme="light">
		{@render children()}
	</div>

	<div class="root" data-theme="dark">
		{@render children()}
	</div>
</div>

<style>
	.side-by-side {
		display: flex;
		overflow: hidden;
		flex-direction: row;
		width: calc(100vw - 8px);
		min-height: 100vh;
	}

	.side-by-side > * {
		padding: 20px;
		flex: 1;
		max-width: 50%;
		transform: scale(1);
	}
</style>
