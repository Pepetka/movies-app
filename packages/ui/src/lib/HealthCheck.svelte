<script lang="ts">
	import type { HealthStatus } from '$lib/types/health';

	interface Props {
		status: HealthStatus;
		lastChecked?: Date;
		latency?: number;
		error?: string;
		compact?: boolean;
		onclick?: () => void;
	}

	let { status, lastChecked, latency, error, compact = false, onclick }: Props = $props();

	const statusConfig = {
		loading: { color: 'var(--health-check-color-loading, #6b7280)', text: 'Checking...' },
		online: { color: 'var(--health-check-color-online, #10b981)', text: 'Online' },
		degraded: { color: 'var(--health-check-color-degraded, #f59e0b)', text: 'Degraded' },
		offline: { color: 'var(--health-check-color-offline, #ef4444)', text: 'Offline' }
	};

	const config = $derived(statusConfig[status]);
</script>

<div role="status" aria-live="polite" aria-label="Server health status">
	<button
		class="health-check"
		class:compact
		{onclick}
		type="button"
		aria-label="Refresh health status"
	>
		<span
			class="indicator"
			class:pulse={status === 'loading'}
			style="background-color: {config.color}"
		></span>
		<div class="content">
			<span class="status-text">{config.text}</span>
			{#if !compact}
				{#if (status === 'online' || status === 'degraded') && latency !== undefined}
					<span class="details">{latency}ms</span>
				{:else if (status === 'offline' || status === 'degraded') && error}
					<span class="details error">{error}</span>
				{/if}
				<span class="details">{lastChecked}</span>
			{/if}
		</div>
	</button>
</div>

<style>
	.health-check {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.health-check:hover {
		background: rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	.health-check.compact {
		padding: 6px 10px;
		gap: 6px;
	}

	.indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.indicator.pulse {
		animation: pulse var(--health-check-pulse-duration, 2s) ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.status-text {
		font-size: 14px;
		font-weight: 500;
		color: rgba(0, 0, 0, 0.85);
	}

	.details {
		font-size: 12px;
		color: rgba(0, 0, 0, 0.6);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.details.error {
		color: var(--health-check-color-offline, #ef4444);
	}

	.health-check.compact .content {
		flex-direction: row;
		align-items: center;
		gap: 4px;
	}

	@media (max-width: 640px) {
		.health-check {
			padding: 6px 10px;
			gap: 6px;
		}

		.status-text {
			font-size: 13px;
		}

		.details {
			font-size: 11px;
		}
	}
</style>
