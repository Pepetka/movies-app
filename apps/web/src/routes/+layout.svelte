<script lang="ts">
	import { StatusIndicator, UIProvider } from '@repo/ui';
	import type { Snippet } from 'svelte';

	import { healthStore } from '$lib/modules/health';
	import { authStore } from '$lib/modules/auth';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	import '@repo/ui/styles/bundle.css';

	interface IProps {
		children: Snippet;
	}

	const { children }: IProps = $props();

	$effect(() => {
		healthStore.startPolling();
		void authStore.checkAuth();
		return () => {
			healthStore.destroy();
			authStore.destroy();
		};
	});

	const handleHealthClick = () => {
		void healthStore.check();
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	<div class="bg-dots">
		<div class="dot dot-1"></div>
		<div class="dot dot-2"></div>
		<div class="dot dot-3"></div>
		<div class="dot dot-4"></div>
		<div class="dot dot-5"></div>
		<div class="dot dot-6"></div>
	</div>

	<UIProvider toastPosition="top-center" />

	{#if browser}
		<div class="status-indicator">
			<StatusIndicator
				status={healthStore.status}
				onclick={handleHealthClick}
				title={healthStore.status}
			/>
		</div>
	{/if}

	<main>
		{@render children()}
	</main>
</div>

<style>
	.layout {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		position: relative;
		overflow: hidden;
	}

	.bg-dots {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.dot {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--color-secondary) 18%, transparent) 50%,
			transparent 70%
		);
	}

	.dot-1 {
		width: 40vmin;
		height: 40vmin;
		max-width: 450px;
		max-height: 450px;
		top: -10%;
		right: -5%;
		opacity: 0.35;
		filter: blur(max(8vmin, 50px));
	}
	.dot-2 {
		width: 25vmin;
		height: 25vmin;
		max-width: 280px;
		max-height: 280px;
		bottom: -5%;
		left: -5%;
		opacity: 0.3;
		filter: blur(max(6vmin, 40px));
	}
	.dot-3 {
		width: 28vmin;
		height: 28vmin;
		max-width: 320px;
		max-height: 320px;
		top: 40%;
		left: -8%;
		opacity: 0.28;
		filter: blur(max(5.5vmin, 35px));
	}
	.dot-4 {
		width: 18vmin;
		height: 18vmin;
		max-width: 200px;
		max-height: 200px;
		top: 70%;
		right: 10%;
		opacity: 0.25;
		filter: blur(max(4.5vmin, 30px));
	}
	.dot-5 {
		width: 26vmin;
		height: 26vmin;
		max-width: 300px;
		max-height: 300px;
		bottom: 10%;
		left: 30%;
		opacity: 0.27;
		filter: blur(max(6vmin, 40px));
	}
	.dot-6 {
		width: 17vmin;
		height: 17vmin;
		max-width: 190px;
		max-height: 190px;
		top: 20%;
		left: 35%;
		opacity: 0.22;
		filter: blur(max(4vmin, 25px));
	}

	.status-indicator {
		position: fixed;
		top: var(--space-2);
		right: var(--space-2);
		z-index: var(--z-fixed);
		line-height: 0;
	}

	main {
		flex: 1;
		width: 100%;
		position: relative;
		z-index: 1;
	}
</style>
