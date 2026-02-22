import type { HTMLAttributes } from 'svelte/elements';

export interface Tab {
	id: string;
	label: string;
	count?: number;
	disabled?: boolean;
}

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	tabs: Tab[];
	value?: string;
	defaultValue?: string;
	onChange?: (tabId: string) => void;
	scrollable?: boolean;
	ariaLabel?: string;
}
