import type {
	GroupMemberResponseDto,
	GroupMemberResponseDtoRole,
	GroupResponseDtoCurrentUserRole
} from '$lib/api/generated/types';

import type { ConfirmAction } from './constants';

type UserRole = GroupMemberResponseDtoRole | GroupResponseDtoCurrentUserRole;

export const canManageMember = (
	memberRole: GroupMemberResponseDtoRole,
	currentUserRole?: UserRole | null
): boolean => {
	if (!currentUserRole) return false;
	if (currentUserRole === 'admin') return memberRole !== 'admin';
	if (currentUserRole === 'moderator') return memberRole === 'member';
	return false;
};

export const getDropdownItems = (
	member: GroupMemberResponseDto,
	currentUserRole?: UserRole | null
): { type: ConfirmAction; label: string }[] => {
	const isAdmin = currentUserRole === 'admin';
	const items: { type: ConfirmAction; label: string }[] = [];

	if (isAdmin) {
		if (member.role === 'member') {
			items.push({ type: 'make-moderator', label: 'Сделать модератором' });
		} else if (member.role === 'moderator') {
			items.push({ type: 'demote-moderator', label: 'Снять модератора' });
		}
		items.push({ type: 'transfer-ownership', label: 'Передать права' });
	}

	if (canManageMember(member.role, currentUserRole)) {
		items.push({ type: 'remove', label: 'Удалить' });
	}

	return items;
};
