export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
	const focusableSelectors = [
		'a[href]',
		'button:not([disabled])',
		'textarea:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'[contenteditable]',
		'audio[controls]',
		'video[controls]',
		'details > summary:first-child',
		'[tabindex]:not([tabindex="-1"])'
	];
	return Array.from(container.querySelectorAll(focusableSelectors.join(', '))).filter((el) => {
		const style = getComputedStyle(el);
		return style.display !== 'none' && style.visibility !== 'hidden';
	}) as HTMLElement[];
};

export const createFocusTrap = (getElement: () => HTMLElement | null) => {
	return (e: KeyboardEvent) => {
		const element = getElement();
		if (!element || e.key !== 'Tab') return;

		const focusableElements = getFocusableElements(element);
		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

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
	};
};

export const lockScroll = (): (() => void) => {
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
};

export const autoFocusFirst = (container: HTMLElement): void => {
	const elements = getFocusableElements(container);
	if (elements.length > 0) {
		elements[0].focus();
	} else {
		container.focus();
	}
};
