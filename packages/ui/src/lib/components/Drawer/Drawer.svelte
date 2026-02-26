<script lang="ts">
	import type { IProps, DrawerPosition } from './Drawer.types.svelte';

	let {
		open = $bindable(),
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

	let overlayElement = $state.raw<HTMLDivElement | null>(null);
	let drawerElement = $state.raw<HTMLDivElement | null>(null);

	let isDragging = $state(false);
	let dragOffset = $state(0);
	let dragStartY = 0;
	let drawerHeight = 0;

	const drawerId = crypto.randomUUID();
	const headerId = `${drawerId}-header`;

	const defaultSizes: Record<DrawerPosition, string> = {
		left: '320px',
		right: '320px',
		bottom: 'auto'
	};

	const DRAG_THRESHOLD = 100;

	const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
		const focusableSelectors = [
			'a[href]',
			'button:not([disabled])',
			'textarea:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'[tabindex]:not([tabindex="-1"])'
		];
		return Array.from(container.querySelectorAll(focusableSelectors.join(', '))).filter(
			(el) => getComputedStyle(el).display !== 'none'
		) as HTMLElement[];
	};

	const trapFocus = (e: KeyboardEvent) => {
		if (!drawerElement) return;
		const focusableElements = getFocusableElements(drawerElement);
		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (e.key === 'Tab') {
			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (!open) return;
		if (closeOnEscape && e.key === 'Escape') {
			close();
		}
		trapFocus(e);
	};

	const handleOverlayClick = (e: MouseEvent) => {
		if (closeOnOverlay && e.target === overlayElement) {
			close();
		}
	};

	const startDrag = (clientY: number) => {
		if (position !== 'bottom' || !drawerElement) return;
		drawerHeight = drawerElement.offsetHeight;
		dragStartY = clientY;
		dragOffset = 0;
		isDragging = true;
	};

	const updateDrag = (clientY: number) => {
		if (!isDragging || position !== 'bottom') return;
		const diff = clientY - dragStartY;
		dragOffset = Math.max(0, Math.min(diff, drawerHeight));
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
			const savedActiveElement = document.activeElement;
			const previousBodyOverflow = document.body.style.overflow;
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

			document.body.style.overflow = 'hidden';
			if (scrollbarWidth > 0) {
				document.body.style.paddingRight = `${scrollbarWidth}px`;
			}

			return () => {
				document.body.style.overflow = previousBodyOverflow;
				if (scrollbarWidth > 0) {
					document.body.style.paddingRight = '';
				}
				if (savedActiveElement && 'focus' in savedActiveElement) {
					(savedActiveElement as HTMLElement).focus();
				}
			};
		}
	});

	$effect(() => {
		if (open && drawerElement) {
			const focusableElements = getFocusableElements(drawerElement);
			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			} else {
				drawerElement.focus();
			}
		}
	});

	const drawerSize = $derived(size ?? defaultSizes[position]);
	const dragTransform = $derived(isDragging || dragOffset > 0 ? `translateY(${dragOffset}px)` : '');
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		bind:this={overlayElement}
		class="ui-drawer-overlay"
		class:dragging={isDragging && position === 'bottom'}
		onclick={handleOverlayClick}
		aria-hidden="true"
	>
		<div
			bind:this={drawerElement}
			class={['ui-drawer', position, open ? 'open' : '', className]}
			class:dragging={isDragging && position === 'bottom'}
			style="--drawer-size: {drawerSize}; --drag-transform: {dragTransform}"
			role="dialog"
			aria-modal="true"
			aria-labelledby={header ? headerId : undefined}
			tabindex="-1"
			{...restProps}
		>
			{#if position === 'bottom'}
				<button
					type="button"
					class="ui-drawer-handle-area"
					tabindex="-1"
					aria-label="Перетащите вниз, чтобы закрыть"
					ontouchstart={handleTouchStart}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
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
	.ui-drawer-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal-backdrop);
		background-color: var(--bg-overlay);
		animation: overlay-fade-in var(--transition-fast) var(--ease-out);
	}

	.ui-drawer-overlay.dragging {
		touch-action: none;
	}

	@keyframes overlay-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.ui-drawer {
		position: fixed;
		z-index: var(--z-modal);
		display: flex;
		flex-direction: column;
		max-height: 100vh;
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		transition: transform var(--transition-base) var(--ease-out);
	}

	.ui-drawer.dragging {
		transition: none;
	}

	.ui-drawer.left {
		left: 0;
		top: 0;
		height: 100vh;
		width: var(--drawer-size, 320px);
		transform: translateX(-100%);
	}

	.ui-drawer.left.open {
		transform: translateX(0);
	}

	.ui-drawer.right {
		right: 0;
		top: 0;
		height: 100vh;
		width: var(--drawer-size, 320px);
		transform: translateX(100%);
	}

	.ui-drawer.right.open {
		transform: translateX(0);
	}

	.ui-drawer.bottom {
		left: 0;
		right: 0;
		bottom: 0;
		max-height: 85vh;
		border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
		transform: translateY(100%);
		--drag-transform: '';
	}

	.ui-drawer.bottom.open {
		transform: translateY(0);
	}

	.ui-drawer.bottom.open.dragging {
		transform: var(--drag-transform, translateY(0));
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

	.ui-drawer-body::-webkit-scrollbar-thumb:hover {
		background-color: var(--text-tertiary);
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
