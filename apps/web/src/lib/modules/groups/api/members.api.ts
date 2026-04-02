import type { GroupMemberResponseDto } from '$lib/api/generated/types';
import { groupsControllerGetMembersV1 } from '$lib/api/generated/api';

export const getGroupMembers = (
	id: number,
	signal?: AbortSignal
): Promise<GroupMemberResponseDto[]> => {
	return groupsControllerGetMembersV1(id, { signal });
};
