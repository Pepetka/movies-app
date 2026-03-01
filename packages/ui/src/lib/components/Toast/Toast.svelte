<script lang="ts">
	import { CheckCircle, XCircle, Info, AlertTriangle, X } from '@lucide/svelte';

	import type { IProps } from './Toast.types.svelte';

	const { toast, onDismiss, class: className, ...restProps }: IProps = $props();

	let startX = $state(0);
	let currentX = $state(0);
	let isDragging = $state(false);
	let isLeaving = $state(false);

	const translateX = $derived(isDragging ? currentX - startX : 0);
	const opacity = $derived(isLeaving ? 0 : isDragging ? 1 - Math.abs(translateX) / 200 : 1);

	const handleDragStart = (clientX: number) => {
		startX = clientX;
		currentX = clientX;
		isDragging = true;
	};

	const handleDragMove = (clientX: number) => {
		if (!isDragging) return;
		currentX = clientX;
	};

	const handleDragEnd = () => {
		if (!isDragging) return;
		const diff = currentX - startX;
		const threshold = 100;

		if (Math.abs(diff) > threshold) {
			dismiss();
		} else {
			currentX = startX;
		}
		isDragging = false;
	};

	const handleTouchStart = (e: TouchEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('.ui-toast-actions')) return;
		handleDragStart(e.touches[0].clientX);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isDragging) return;
		handleDragMove(e.touches[0].clientX);
	};

	const handleTouchEnd = () => {
		handleDragEnd();
	};

	const handleMouseDown = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('.ui-toast-actions')) return;
		handleDragStart(e.clientX);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		handleDragMove(e.clientX);
	};

	const handleMouseUp = () => {
		handleDragEnd();
	};

	const handleMouseLeave = () => {
		if (isDragging) {
			handleDragEnd();
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			dismiss();
		}
	};

	const dismiss = () => {
		isLeaving = true;
		setTimeout(() => onDismiss(toast.id), 150);
	};

	$effect(() => {
		if (toast.duration > 0) {
			const timer = setTimeout(dismiss, toast.duration);
			return () => clearTimeout(timer);
		}
	});

	const isAlert = $derived(toast.type === 'error' || toast.type === 'warning');
</script>

<div
	class={['ui-toast', toast.type, isDragging && 'dragging', className]}
	class:entering={!isLeaving && !isDragging}
	class:leaving={isLeaving}
	role={isAlert ? 'alert' : 'status'}
	aria-live={isAlert ? 'assertive' : 'polite'}
	aria-atomic="true"
	tabindex="-1"
	onkeydown={handleKeydown}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	style="--translate-x: {translateX}px; --opacity: {opacity};"
	{...restProps}
>
	{#if toast.type === 'success'}
		<CheckCircle class="ui-toast-icon" size={20} style="color: var(--icon-color)" />
	{:else if toast.type === 'error'}
		<XCircle class="ui-toast-icon" size={20} style="color: var(--icon-color)" />
	{:else if toast.type === 'info'}
		<Info class="ui-toast-icon" size={20} style="color: var(--icon-color)" />
	{:else if toast.type === 'warning'}
		<AlertTriangle class="ui-toast-icon" size={20} style="color: var(--icon-color)" />
	{/if}
	<span class="ui-toast-message">{toast.message}</span>

	<div class="ui-toast-actions">
		{#if toast.action}
			<button
				type="button"
				class="ui-toast-action"
				onclick={(e) => {
					e.stopPropagation();
					toast.action!.onClick();
				}}
			>
				{toast.action.label}
			</button>
		{/if}
		{#if toast.dismissible}
			<button
				type="button"
				class="ui-toast-close"
				aria-label="Close"
				onclick={(e) => {
					e.stopPropagation();
					dismiss();
				}}
			>
				<X size={16} />
			</button>
		{/if}
	</div>
</div>

<style>
	.ui-toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: var(--toast-min-width);
		max-width: var(--toast-max-width);
		padding: var(--toast-padding);
		border-radius: var(--toast-border-radius);
		box-shadow: var(--shadow-lg);
		transform: translateX(var(--translate-x, 0));
		opacity: var(--opacity, 1);
		transition:
			opacity var(--transition-fast) var(--ease-out),
			transform var(--transition-base) var(--ease-out);
		user-select: none;
	}

	.ui-toast.dragging {
		transition: none;
	}

	.ui-toast.entering {
		animation: toast-enter var(--transition-base) var(--ease-out);
	}

	.ui-toast.leaving {
		animation: toast-leave var(--transition-fast) var(--ease-out);
	}

	@keyframes toast-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-4)) scale(0.95);
		}
	}

	@keyframes toast-leave {
		to {
			opacity: 0;
			transform: translateX(100%);
		}
	}

	/* Types */
	.ui-toast.success {
		--icon-color: var(--toast-success-icon);
		background-color: var(--toast-success-bg);
		color: var(--toast-success-text);
	}

	.ui-toast.error {
		--icon-color: var(--toast-error-icon);
		background-color: var(--toast-error-bg);
		color: var(--toast-error-text);
	}

	.ui-toast.info {
		--icon-color: var(--toast-info-icon);
		background-color: var(--toast-info-bg);
		color: var(--toast-info-text);
	}

	.ui-toast.warning {
		--icon-color: var(--toast-warning-icon);
		background-color: var(--toast-warning-bg);
		color: var(--toast-warning-text);
	}

	/* Icon */
	.ui-toast-icon {
		flex-shrink: 0;
		width: var(--toast-icon-size);
		height: var(--toast-icon-size);
	}

	/* Message */
	.ui-toast-message {
		flex: 1;
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
	}

	/* Actions */
	.ui-toast-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-left: var(--space-2);
	}

	.ui-toast-action {
		padding: var(--toast-action-padding);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: inherit;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: color var(--transition-fast) var(--ease-out);
	}

	.ui-toast-action:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	/* Close button */
	.ui-toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1);
		color: inherit;
		background: transparent;
		border: none;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity var(--transition-fast) var(--ease-out);
	}

	@media (hover: hover) {
		.ui-toast-close:hover {
			opacity: 1;
		}
	}

	.ui-toast-close:active {
		opacity: 1;
		transform: scale(0.9);
	}

	.ui-toast-close:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
