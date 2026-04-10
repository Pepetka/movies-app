<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	import { createFocusTrap, lockScroll, autoFocusFirst } from '../../utils/focus-trap';
	import type { IProps, DrawerPosition } from './Drawer.types.svelte';
	import { OVERLAY_FADE, DRAWER_FLY } from '../../utils/transitions';
	import { generateId } from '../../utils/id';

	let {
		open = $bindable(false),
		position = 'left',
		size,
		closeOnOverlay = true,
		closeOnEscape = true,
		onClose,
		class: className,
		children,
		header,
		footer,
		...restProps
	}: IProps = $props();

	let drawerElement = $state.raw<HTMLDivElement | null>(null);
	let handleElement = $state.raw<HTMLButtonElement | null>(null);

	let isDragging = $state(false);
	let dragOffset = $state(0);
	let dragStartY = 0;

	let drawerHeight = $state.raw(0);

	const drawerId = generateId();
	const headerId = `${drawerId}-header`;

	const defaultSizes: Record<DrawerPosition, string> = {
		left: '320px',
		right: '320px',
		bottom: 'auto'
	};

	const DRAG_THRESHOLD = 100;
	const OVERSCROLL_LIMIT = 80;
	const OVERSCROLL_RESISTANCE = 0.4;

	const trapFocus = createFocusTrap(() => drawerElement);

	const handleKeydown = (e: KeyboardEvent) => {
		if (closeOnEscape && e.key === 'Escape') {
			close();
		}
		trapFocus(e);
	};

	const handleOverlayClick = (e: MouseEvent) => {
		if (closeOnOverlay && !drawerElement?.contains(e.target as Node)) {
			close();
		}
	};

	const startDrag = (clientY: number) => {
		if (position !== 'bottom' || !drawerElement || !closeOnOverlay) return;
		drawerHeight = drawerElement.offsetHeight;
		dragStartY = clientY;
		dragOffset = 0;
		isDragging = true;
	};

	const updateDrag = (clientY: number) => {
		if (!isDragging || position !== 'bottom') return;
		const diff = clientY - dragStartY;

		if (diff >= 0) {
			dragOffset = Math.min(diff, drawerHeight);
		} else {
			const absDiff = Math.abs(diff);
			const elasticOffset = absDiff * OVERSCROLL_RESISTANCE;
			dragOffset = -Math.min(elasticOffset, OVERSCROLL_LIMIT);
		}
	};

	const endDrag = () => {
		if (!isDragging || position !== 'bottom') return;
		const shouldClose = dragOffset > DRAG_THRESHOLD;
		isDragging = false;

		if (shouldClose) {
			close();
		}

		dragOffset = 0;
	};

	const handleTouchStart = (e: TouchEvent) => {
		startDrag(e.touches[0].clientY);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isDragging) return;
		e.preventDefault();
		updateDrag(e.touches[0].clientY);
	};

	const handleTouchEnd = () => {
		endDrag();
	};

	const handleMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		startDrag(e.clientY);

		const handleMouseMove = (e: MouseEvent) => {
			updateDrag(e.clientY);
		};

		const handleMouseUp = () => {
			endDrag();
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	const close = () => {
		onClose?.();
		open = false;
	};

	$effect(() => {
		if (open) {
			return lockScroll();
		}
	});

	$effect(() => {
		if (open && drawerElement) {
			autoFocusFirst(drawerElement);
		}
	});

	$effect(() => {
		const element = handleElement;
		if (position !== 'bottom' || !element) return;

		element.addEventListener('touchstart', handleTouchStart, { passive: true });
		element.addEventListener('touchmove', handleTouchMove, { passive: false });
		element.addEventListener('touchend', handleTouchEnd, { passive: true });

		return () => {
			element.removeEventListener('touchstart', handleTouchStart);
			element.removeEventListener('touchmove', handleTouchMove);
			element.removeEventListener('touchend', handleTouchEnd);
		};
	});

	$effect(() => {
		if (open) {
			drawerHeight = drawerElement?.offsetHeight ?? 0;
		}
		return () => {
			drawerHeight = 0;
		};
	});

	const drawerSize = $derived(size ?? defaultSizes[position]);
	const dragTransform = $derived(
		isDragging || dragOffset !== 0 ? `translateY(${dragOffset}px)` : ''
	);
	const overlayOpacity = $derived.by(() => {
		if (!isDragging || drawerHeight === 0) return 1;
		const progress = Math.max(0, Math.min(1, 1 - dragOffset / drawerHeight));
		return progress;
	});
	const flyParams = $derived.by(() => {
		switch (position) {
			case 'left':
				return DRAWER_FLY.left(drawerSize);
			case 'right':
				return DRAWER_FLY.right(drawerSize);
			case 'bottom':
				return DRAWER_FLY.bottom;
		}
	});
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<div class="ui-drawer-root" role="presentation" onclick={handleOverlayClick}>
		<div
			class="ui-drawer-backdrop"
			style:opacity={isDragging && position === 'bottom' ? overlayOpacity : undefined}
			in:fade={OVERLAY_FADE}
			out:fade={OVERLAY_FADE}
		></div>
		<div
			bind:this={drawerElement}
			class={['ui-drawer', position, isDragging ? 'dragging' : '', className]}
			style:--drawer-width={drawerSize}
			style:--drag-transform={dragTransform}
			style:--drawer-bottom-offset="{OVERSCROLL_LIMIT}px"
			role="dialog"
			aria-modal="true"
			aria-labelledby={header ? headerId : undefined}
			tabindex="-1"
			out:fly={flyParams}
			in:fly={flyParams}
			{...restProps}
		>
			{#if position === 'bottom' && closeOnOverlay}
				<button
					bind:this={handleElement}
					type="button"
					class="ui-drawer-handle-area"
					tabindex="-1"
					aria-label="Drag down to close"
					onmousedown={handleMouseDown}
				>
					<div class="ui-drawer-handle"></div>
				</button>
			{/if}

			{#if header}
				<div class="ui-drawer-header" id={headerId}>
					{@render header(close)}
				</div>
			{/if}

			{#if children}
				<div class="ui-drawer-body">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="ui-drawer-footer">
					{@render footer(close)}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.ui-drawer-root {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal-backdrop);
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
	}

	.ui-drawer-root:has(.ui-drawer.right) {
		justify-content: flex-end;
	}

	.ui-drawer.dragging {
		touch-action: none;
	}

	.ui-drawer-backdrop {
		position: absolute;
		inset: 0;
		background-color: var(--bg-overlay);
	}

	.ui-drawer {
		position: relative;
		z-index: var(--z-modal);
		display: flex;
		flex-direction: column;
		max-height: 100vh;
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
	}

	.ui-drawer.bottom.dragging {
		transform: var(--drag-transform);
	}

	.ui-drawer.left,
	.ui-drawer.right {
		top: 0;
		height: 100vh;
		width: var(--drawer-width, 320px);
	}

	.ui-drawer.left {
		left: 0;
	}

	.ui-drawer.right {
		right: 0;
	}

	.ui-drawer.bottom {
		left: 0;
		right: 0;
		bottom: calc(-1 * var(--drawer-bottom-offset));
		max-height: 85vh;
		width: 100%;
		padding-bottom: var(--drawer-bottom-offset);
		border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
	}

	.ui-drawer-handle-area {
		width: 100%;
		padding: var(--space-2) 0;
		flex-shrink: 0;
		touch-action: none;
		cursor: grab;
		user-select: none;
		display: block;
		background: transparent;
		border: none;
		text-align: inherit;
	}

	.ui-drawer-handle {
		width: 36px;
		height: 4px;
		background: var(--border-secondary);
		border-radius: var(--radius-full);
		margin: var(--space-3) auto;
		flex-shrink: 0;
	}

	.ui-drawer-handle-area:active .ui-drawer-handle {
		background: var(--text-tertiary);
	}

	.ui-drawer-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		flex-shrink: 0;
	}

	.ui-drawer-header :global(h2),
	.ui-drawer-header :global(h1),
	.ui-drawer-header :global(h3) {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
		flex: 1;
	}

	.ui-drawer-body {
		flex: 1;
		padding: var(--space-3) var(--space-5);
		overflow-y: auto;
	}

	.ui-drawer-body:first-child {
		padding-top: var(--space-5);
	}

	.ui-drawer-body:last-child {
		padding-bottom: var(--space-5);
	}

	.ui-drawer-body::-webkit-scrollbar {
		width: var(--space-2);
	}

	.ui-drawer-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.ui-drawer-body::-webkit-scrollbar-thumb {
		background-color: var(--border-secondary);
		border-radius: var(--radius-full);
	}

	@media (hover: hover) {
		.ui-drawer-body::-webkit-scrollbar-thumb:hover {
			background-color: var(--text-tertiary);
		}
	}

	.ui-drawer-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.ui-drawer.left,
		.ui-drawer.right {
			width: 100vw;
		}

		.ui-drawer-header,
		.ui-drawer-body,
		.ui-drawer-footer {
			padding-left: var(--space-4);
			padding-right: var(--space-4);
		}
	}
</style>
