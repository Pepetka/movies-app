<script lang="ts">
	import type { ToastContainerProps } from './Toast.types.svelte';
	import { toast } from './toast.store.svelte';
	import Toast from './Toast.svelte';

	const {
		position = 'bottom-center',
		maxToasts = 3,
		class: className,
		...restProps
	}: ToastContainerProps = $props();

	$effect(() => {
		toast.setMaxToasts(maxToasts);
	});

	const positionClasses = $derived.by(() => {
		const positions = {
			'top-center': 'top-center',
			'top-left': 'top-left',
			'top-right': 'top-right',
			'bottom-center': 'bottom-center',
			'bottom-left': 'bottom-left',
			'bottom-right': 'bottom-right'
		};
		return positions[position];
	});
</script>

<div class={['ui-toast-container', positionClasses, className]} {...restProps}>
	{#each toast.toasts as item (item.id)}
		<Toast toast={item} onDismiss={(id) => toast.dismiss(id as string)} />
	{/each}
</div>

<style>
	.ui-toast-container {
		position: fixed;
		z-index: var(--z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--toast-gap);
		padding: var(--toast-margin);
		pointer-events: none;
	}

	.ui-toast-container > :global(*) {
		pointer-events: auto;
	}

	/* Top positions */
	.ui-toast-container.top-center {
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.ui-toast-container.top-left {
		top: 0;
		left: 0;
	}

	.ui-toast-container.top-right {
		top: 0;
		right: 0;
	}

	/* Bottom positions */
	.ui-toast-container.bottom-center {
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.ui-toast-container.bottom-left {
		bottom: 0;
		left: 0;
	}

	.ui-toast-container.bottom-right {
		bottom: 0;
		right: 0;
	}

	@media (max-width: 640px) {
		.ui-toast-container {
			left: 0 !important;
			right: 0 !important;
			transform: none !important;
		}
	}
</style>
