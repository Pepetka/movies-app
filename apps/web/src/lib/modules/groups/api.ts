import { groupsControllerFindAllV1 } from '$lib/api/generated/api';
import type { GroupResponseDto } from '$lib/api/generated/types';

export const getGroups = async (signal?: AbortSignal): Promise<GroupResponseDto[]> => {
	return groupsControllerFindAllV1({ signal });
};
