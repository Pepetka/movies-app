import type { Icon as IconType } from '@lucide/svelte';

import type { FormStatus } from '$lib/utils/validation.svelte';

export type GroupsStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type GroupFormStatus = FormStatus;

export type GroupFormMode = 'create' | 'edit';

export interface GroupFormData {
	name: string;
	description?: string;
	avatarUrl?: string;
}

export interface GroupFormProps {
	mode?: GroupFormMode;
	title?: string;
	subtitle?: string;
	cardTitle?: string;
	cardSubtitle?: string;
	submitLabel?: string;
	submitIcon?: typeof IconType;
	onSubmit?: () => void | Promise<void>;
	form?: GroupFormData;
}
