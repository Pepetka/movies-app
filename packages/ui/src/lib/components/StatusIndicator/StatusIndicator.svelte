<script lang="ts">
	import type { IProps } from './StatusIndicator.types.svelte';

	const { status, size = 'md', title, onclick, ...restProps }: IProps = $props();

	const colors = {
		loading: 'var(--color-warning)',
		online: 'var(--color-success)',
		degraded: 'var(--color-warning)',
		offline: 'var(--color-error)'
	};

	const sizes = {
		sm: 'var(--status-dot-sm)',
		md: 'var(--status-dot-size)',
		lg: 'var(--status-dot-lg)'
	};

	const backgroundColor = $derived(colors[status]);
	const dotSize = $derived(sizes[size]);
</script>

{#if onclick}
	<button
		type="button"
		class={['ui-status-indicator']}
		class:loading={status === 'loading'}
		style:background-color={backgroundColor}
		style:width={dotSize}
		style:height={dotSize}
		{title}
		aria-label={title || status}
		{onclick}
		{...restProps}
	></button>
{:else}
	<div
		class={['ui-status-indicator']}
		class:loading={status === 'loading'}
		style:background-color={backgroundColor}
		style:width={dotSize}
		style:height={dotSize}
		{title}
		role="status"
		aria-label={status}
		{...restProps}
	></div>
{/if}

<style>
	.ui-status-indicator {
		border-radius: var(--radius-full);
		flex-shrink: 0;
		transition: transform var(--transition-fast) var(--ease-out);
	}

	.ui-status-indicator:where(button) {
		cursor: pointer;
		padding: 0;
		border: none;
	}

	.ui-status-indicator:where(button):hover {
		transform: scale(1.2);
	}

	.ui-status-indicator.loading {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
