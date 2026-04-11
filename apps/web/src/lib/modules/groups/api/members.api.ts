import {
	groupsControllerGetMembersV1,
	groupsControllerRemoveMemberV1,
	groupsControllerTransferOwnershipV1,
	groupsControllerUpdateMemberRoleV1
} from '$lib/api/generated/api';
import type {
	GroupMemberResponseDto,
	GroupMemberRoleUpdateDtoRole
} from '$lib/api/generated/types';

export const getGroupMembers = (
	id: number,
	signal?: AbortSignal
): Promise<GroupMemberResponseDto[]> => {
	return groupsControllerGetMembersV1(id, { signal });
};

export const updateMemberRole = (
	groupId: number,
	userId: number,
	role: GroupMemberRoleUpdateDtoRole
): Promise<void> => {
	return groupsControllerUpdateMemberRoleV1(groupId, userId, { role });
};

export const removeMember = (groupId: number, userId: number): Promise<void> => {
	return groupsControllerRemoveMemberV1(groupId, userId);
};

export const transferOwnership = (groupId: number, targetUserId: number): Promise<void> => {
	return groupsControllerTransferOwnershipV1(groupId, { targetUserId });
};
