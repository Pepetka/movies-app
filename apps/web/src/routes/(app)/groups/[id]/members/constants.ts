import type { BadgeVariant } from '@repo/ui';

import type { GroupMemberResponseDtoRole } from '$lib/api/generated/types';

export type ConfirmAction = 'remove' | 'make-moderator' | 'demote-moderator' | 'transfer-ownership';

export const ROLE_BADGE_VARIANT: Record<GroupMemberResponseDtoRole, BadgeVariant> = {
	admin: 'warning',
	moderator: 'primary',
	member: 'default'
};

export const ROLE_LABEL: Record<GroupMemberResponseDtoRole, string> = {
	admin: 'Админ',
	moderator: 'Модератор',
	member: 'Участник'
};

export interface ConfirmTextItem {
	title: string;
	getDescription: (name: string) => string;
	button: string;
	variant: 'danger' | 'primary';
	successMessage: string;
	errorFallback: string;
}

export const CONFIRM_TEXT: Record<ConfirmAction, ConfirmTextItem> = {
	remove: {
		title: 'Удалить участника?',
		getDescription: (name) => `${name} будет удалён из группы.`,
		button: 'Удалить',
		variant: 'danger',
		successMessage: 'Участник удалён',
		errorFallback: 'Ошибка удаления'
	},
	'make-moderator': {
		title: 'Назначить модератором?',
		getDescription: (name) => `${name} станет модератором группы.`,
		button: 'Назначить',
		variant: 'primary',
		successMessage: 'Модератор назначен',
		errorFallback: 'Ошибка назначения'
	},
	'demote-moderator': {
		title: 'Снять модератора?',
		getDescription: (name) => `${name} снова станет обычным участником.`,
		button: 'Снять',
		variant: 'primary',
		successMessage: 'Модератор снят',
		errorFallback: 'Ошибка снятия'
	},
	'transfer-ownership': {
		title: 'Передать права администратора?',
		getDescription: (name) =>
			`Вы передадите права ${name} и станете модератором. Это действие нельзя отменить.`,
		button: 'Передать права',
		variant: 'primary',
		successMessage: 'Права переданы',
		errorFallback: 'Ошибка передачи прав'
	}
};
