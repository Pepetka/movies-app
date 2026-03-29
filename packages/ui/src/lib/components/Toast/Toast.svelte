<script lang="ts">
	import { CheckCircle, XCircle, Info, AlertTriangle, X } from '@lucide/svelte';

	import type { IProps } from './Toast.types.svelte';

	const { toast, onDismiss, isTop = false, class: className, ...restProps }: IProps = $props();

	const AXIS_LOCK_THRESHOLD = 5;
	const DISMISS_X_THRESHOLD = 100;
	const DISMISS_Y_THRESHOLD = 20;
	const OPACITY_DRAG_DISTANCE = 200;

	let startX = $state(0);
	let startY = $state(0);
	let currentX = $state(0);
	let currentY = $state(0);
	let isDragging = $state(false);
	let isLeaving = $state(false);
	let isHovered = $state(false);
	let dragAxis = $state<'x' | 'y' | null>(null);
	let leaveTransform = $state('translateX(100%)');

	let progress = $state(0);
	let isPaused = $derived(isDragging || isHovered);

	const constrainY = (y: number) => {
		const diff = y - startY;
		return isTop ? Math.min(0, diff) : Math.max(0, diff);
	};

	const translateX = $derived.by(() => {
		if (!isDragging || dragAxis !== 'x') return 0;
		return currentX - startX;
	});
	const translateY = $derived.by(() => {
		if (!isDragging || dragAxis !== 'y') return 0;
		return constrainY(currentY);
	});
	const dragDistance = $derived(
		isDragging && dragAxis === 'y' ? Math.abs(translateY) : Math.abs(translateX)
	);
	const opacity = $derived(
		isLeaving ? 0 : isDragging ? 1 - dragDistance / OPACITY_DRAG_DISTANCE : 1
	);

	const handleDragStart = (clientX: number, clientY: number) => {
		startX = clientX;
		startY = clientY;
		currentX = clientX;
		currentY = clientY;
		isDragging = true;
		dragAxis = null;
	};

	const handleDragMove = (clientX: number, clientY: number) => {
		if (!isDragging) return;
		currentX = clientX;
		currentY = clientY;

		if (dragAxis === null) {
			const dx = Math.abs(clientX - startX);
			const dy = Math.abs(clientY - startY);
			if (dx > AXIS_LOCK_THRESHOLD || dy > AXIS_LOCK_THRESHOLD) {
				dragAxis = dx >= dy ? 'x' : 'y';
			}
		}
	};

	const handleDragEnd = () => {
		if (!isDragging) return;

		let shouldDismiss = false;
		const finalY = constrainY(currentY);

		if (dragAxis === 'x' && Math.abs(currentX - startX) > DISMISS_X_THRESHOLD) {
			shouldDismiss = true;
			leaveTransform = currentX > startX ? 'translateX(100%)' : 'translateX(-100%)';
		} else if (dragAxis === 'y' && Math.abs(finalY) > DISMISS_Y_THRESHOLD) {
			shouldDismiss = true;
			leaveTransform = isTop ? 'translateY(-100%)' : 'translateY(100%)';
		}

		if (shouldDismiss) {
			dismiss();
		}
		isDragging = false;
		dragAxis = null;
	};

	const handleTouchStart = (e: TouchEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('.ui-toast-actions')) return;
		handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isDragging) return;
		handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
	};

	const handleTouchEnd = () => {
		handleDragEnd();
	};

	const handleMouseDown = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('.ui-toast-actions')) return;
		handleDragStart(e.clientX, e.clientY);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		handleDragMove(e.clientX, e.clientY);
	};

	const handleMouseUp = () => {
		handleDragEnd();
	};

	const handleMouseEnter = () => {
		isHovered = true;
	};

	const handleMouseLeave = () => {
		isHovered = false;
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
		if (toast.duration <= 0) return;

		let startTime = performance.now();
		let pausedAt = 0;
		let totalPaused = 0;
		let rafId: number;

		const tick = (now: number) => {
			if (isLeaving) {
				cancelAnimationFrame(rafId);
				return;
			}

			if (isPaused) {
				if (pausedAt === 0) pausedAt = now;
				rafId = requestAnimationFrame(tick);
				return;
			}

			if (pausedAt !== 0) {
				totalPaused += now - pausedAt;
				pausedAt = 0;
			}

			const elapsed = now - startTime - totalPaused;
			progress = Math.min(elapsed / toast.duration, 1);

			if (progress >= 1) {
				dismiss();
				return;
			}

			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
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
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	style="--translate-x: {translateX}px; --translate-y: {translateY}px; --opacity: {opacity}; --leave-transform: {leaveTransform}; --progress: {1 -
		progress};"
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

	{#if toast.duration > 0}
		<div class="ui-toast-progress">
			<div class="ui-toast-progress-bar"></div>
		</div>
	{/if}
</div>

<style>
	.ui-toast {
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: var(--toast-min-width);
		max-width: var(--toast-max-width);
		padding: var(--toast-padding);
		border-radius: var(--toast-border-radius);
		box-shadow: var(--shadow-lg);
		transform: translate(var(--translate-x, 0), var(--translate-y, 0));
		opacity: var(--opacity, 1);
		transition:
			opacity var(--transition-fast) var(--ease-out),
			transform var(--transition-base) var(--ease-out);
		user-select: none;
		touch-action: none;
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
			transform: var(--leave-transform, translateX(100%));
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

	/* Progress bar */
	.ui-toast-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
	}

	.ui-toast-progress-bar {
		width: 100%;
		height: 100%;
		transform-origin: left;
		transform: scaleX(var(--progress, 1));
		background: currentColor;
		opacity: 0.25;
	}
</style>
