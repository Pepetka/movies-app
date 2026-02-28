<script lang="ts">
	import type { IProps } from './Modal.types.svelte';

	let {
		open = $bindable(false),
		size = 'md',
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
	let modalElement = $state.raw<HTMLDivElement | null>(null);

	const modalId = crypto.randomUUID();
	const headerId = `${modalId}-header`;

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
		if (!modalElement) return;
		const focusableElements = getFocusableElements(modalElement);
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

	const close = () => {
		onClose?.();
		open = false;
	};

	$effect(() => {
		if (open) {
			const savedActiveElement = document.activeElement as HTMLElement | null;
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
					savedActiveElement.focus();
				}
			};
		}
	});

	$effect(() => {
		if (open && modalElement) {
			const focusableElements = getFocusableElements(modalElement);
			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			} else {
				modalElement.focus();
			}
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		bind:this={overlayElement}
		class={['ui-modal-overlay', className]}
		class:entering={open}
		role="presentation"
		onclick={handleOverlayClick}
		onkeydown={() => {}}
	>
		<div
			bind:this={modalElement}
			class={['ui-modal', size]}
			role="dialog"
			aria-modal="true"
			aria-labelledby={header ? headerId : undefined}
			tabindex="-1"
			{...restProps}
		>
			{#if header}
				<div class="ui-modal-header" id={headerId}>
					{@render header(close)}
				</div>
			{/if}

			{#if children}
				<div class="ui-modal-body">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="ui-modal-footer">
					{@render footer(close)}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.ui-modal-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal-backdrop);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background-color: var(--bg-overlay);
		animation: overlay-fade-in var(--transition-fast) var(--ease-out);
	}

	.ui-modal-overlay.entering {
		animation: overlay-fade-in var(--transition-fast) var(--ease-out);
	}

	@keyframes overlay-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.ui-modal {
		position: relative;
		z-index: var(--z-modal);
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - var(--space-8));
		background-color: var(--bg-primary);
		border-radius: var(--radius-2xl);
		box-shadow: var(--shadow-xl);
		animation: modal-enter var(--transition-base) var(--ease-out);
		overflow: hidden;
	}

	@keyframes modal-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-4)) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Sizes */
	.ui-modal.sm {
		width: 100%;
		max-width: 400px;
	}

	.ui-modal.md {
		width: 100%;
		max-width: 560px;
	}

	.ui-modal.lg {
		width: 100%;
		max-width: 720px;
	}

	.ui-modal.xl {
		width: 100%;
		max-width: 960px;
	}

	.ui-modal.full {
		width: calc(100vw - var(--space-8));
		max-width: none;
		max-height: calc(100vh - var(--space-8));
	}

	/* Header */
	.ui-modal-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		flex-shrink: 0;
	}

	.ui-modal-header :global(h2),
	.ui-modal-header :global(h1),
	.ui-modal-header :global(h3) {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
		flex: 1;
	}

	/* Body */
	.ui-modal-body {
		flex: 1;
		padding: var(--space-3) var(--space-5);
		overflow-y: auto;
	}

	.ui-modal-body:first-child {
		padding-top: var(--space-5);
	}

	.ui-modal-body:last-child {
		padding-bottom: var(--space-5);
	}

	.ui-modal-body::-webkit-scrollbar {
		width: var(--space-2);
	}

	.ui-modal-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.ui-modal-body::-webkit-scrollbar-thumb {
		background-color: var(--border-secondary);
		border-radius: var(--radius-full);
	}

	@media (hover: hover) {
		.ui-modal-body::-webkit-scrollbar-thumb:hover {
			background-color: var(--text-tertiary);
		}
	}

	/* Footer */
	.ui-modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		flex-shrink: 0;
	}

	/* Mobile */
	@media (max-width: 640px) {
		.ui-modal-overlay {
			padding: 0;
		}

		.ui-modal,
		.ui-modal.sm,
		.ui-modal.md,
		.ui-modal.lg,
		.ui-modal.xl,
		.ui-modal.full {
			width: 100vw;
			max-width: 100vw;
			height: 100vh;
			max-height: 100vh;
			border-radius: 0;
		}

		.ui-modal-header,
		.ui-modal-body,
		.ui-modal-footer {
			padding-left: var(--space-4);
			padding-right: var(--space-4);
		}
	}
</style>
