<script lang="ts">
	import { StatusIndicator, ThemeToggle, UIProvider } from '@repo/ui';
	import type { Snippet } from 'svelte';

	import { healthStore } from '$lib/stores/health.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	import '@repo/ui/styles/bundle.css';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();

	$effect(() => {
		if (browser) {
			healthStore.startPolling();
			return () => {
				healthStore.destroy();
			};
		}
	});

	const handleHealthClick = () => {
		void healthStore.check();
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	{#if browser}
		<header class="header">
			<div class="header-inner">
				<ThemeToggle size="sm" />
				<StatusIndicator
					status={healthStore.status}
					onclick={handleHealthClick}
					title={healthStore.status}
				/>
			</div>
		</header>
	{/if}

	<UIProvider />

	<main>
		{@render children()}
	</main>
</div>

<style>
	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-fixed);
		background-color: var(--bg-primary);
		border-bottom: 1px solid var(--border-primary);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-4);
		max-width: var(--container-max-width);
		margin: 0 auto;
		padding: var(--space-3) var(--container-padding);
	}

	main {
		flex: 1;
		width: 100%;
		max-width: var(--container-max-width);
		margin: 0 auto;
		padding: var(--space-16) var(--container-padding) var(--space-8);
	}
</style>
