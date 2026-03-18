import type { Icon } from '@lucide/svelte';
import { z } from 'zod';

import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';
import { createValidator } from '$lib/utils/validation.svelte';

// === Schema ===

const optionalUrl = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().url('Некорректный URL').optional()
);

const optionalString = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().max(500, 'Максимум 500 символов').optional()
);

export const groupSchema = z.object({
	name: z.string().min(1, 'Обязательное поле').max(100, 'Максимум 100 символов'),
	description: optionalString,
	avatarUrl: optionalUrl
});

// === Types ===

export type GroupFormData = z.infer<typeof groupSchema>;

export type GroupFormMode = 'create' | 'edit';

export interface GroupFormProps {
	mode?: GroupFormMode;
	title?: string;
	subtitle?: string;
	cardTitle?: string;
	cardSubtitle?: string;
	submitLabel?: string;
	submitIcon?: typeof Icon;
	onSubmit?: () => void | Promise<void>;
	form?: GroupFormData;
	isSubmitting?: boolean;
}

// === Constants ===

export const EMPTY_GROUP_FORM: GroupFormData = {
	name: '',
	description: '',
	avatarUrl: ''
};

// === Validation ===

export const validateGroupForm = createValidator(groupSchema);

// === Transformers ===

export const groupFormToCreateDto = (form: GroupFormData): GroupCreateDto => ({
	name: form.name,
	description: form.description || undefined,
	avatarUrl: form.avatarUrl || undefined
});

export const groupFormToUpdateDto = (form: GroupFormData): GroupUpdateDto => ({
	name: form.name || undefined,
	description: form.description || undefined,
	avatarUrl: form.avatarUrl || undefined
});

export const groupFormFromEntity = (group: GroupResponseDto): GroupFormData => ({
	name: group.name ?? '',
	description: group.description ?? '',
	avatarUrl: group.avatarUrl ?? ''
});
