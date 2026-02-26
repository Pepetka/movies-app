import type { Icon as LucideIcon } from '@lucide/svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface NavItem {
	id: string;
	label: string;
	Icon: typeof LucideIcon;
	href: string;
	badge?: number;
	badgeLabel?: string;
	hidden?: boolean;
	disabled?: boolean;
}

export interface IProps extends HTMLAttributes<HTMLElement> {
	items: NavItem[];
	value?: string;
	defaultValue?: string;
	onChange?: (itemId: string) => void;
}
