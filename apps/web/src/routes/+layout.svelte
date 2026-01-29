<script lang="ts">
	import { HealthCheck } from '@repo/ui';

	import { healthStore } from '$lib/stores/health.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (browser) {
			healthStore.startPolling();
			return () => {
				healthStore.destroy();
			};
		}
	});

	function handleHealthClick() {
		void healthStore.check();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	{#if browser}
		<header class="header">
			<HealthCheck
				status={healthStore.status}
				lastChecked={healthStore.lastChecked}
				latency={healthStore.latency}
				error={healthStore.error}
				compact={true}
				onclick={handleHealthClick}
			/>
		</header>
	{/if}

	<main>
		{@render children()}
	</main>
</div>

<style>
	.layout {
		min-height: 100vh;
	}

	.header {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 1000;
	}

	main {
		padding-top: 60px;
	}
</style>
