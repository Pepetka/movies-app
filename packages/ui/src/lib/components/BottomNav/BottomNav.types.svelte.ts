import type { HTMLAttributes } from 'svelte/elements';
import type { Icon } from '@lucide/svelte';

export interface NavItem {
	id: string;
	label: string;
	Icon: typeof Icon;
	href: string;
	badge?: number;
	badgeLabel?: string;
	hidden?: boolean;
}

export interface IProps extends HTMLAttributes<HTMLElement> {
	items: NavItem[];
	value?: string;
	defaultValue?: string;
	onChange?: (itemId: string) => void;
}
