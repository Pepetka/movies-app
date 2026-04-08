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
