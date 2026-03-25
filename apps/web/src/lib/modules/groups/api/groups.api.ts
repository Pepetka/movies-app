import {
	groupsControllerFindAllV1,
	groupsControllerCreateV1,
	groupsControllerUpdateV1,
	groupsControllerFindOneV1,
	groupsControllerRemoveV1
} from '$lib/api/generated/api';
import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';

export const getGroups = async (signal?: AbortSignal): Promise<GroupResponseDto[]> => {
	return groupsControllerFindAllV1({ signal });
};

export const getGroup = async (id: number, signal?: AbortSignal): Promise<GroupResponseDto> => {
	return groupsControllerFindOneV1(id, { signal });
};

export const createGroup = async (data: GroupCreateDto): Promise<GroupResponseDto> => {
	return groupsControllerCreateV1(data);
};

export const updateGroup = async (id: number, data: GroupUpdateDto): Promise<GroupResponseDto> => {
	return groupsControllerUpdateV1(id, data);
};

export const deleteGroup = async (id: number): Promise<void> => {
	return groupsControllerRemoveV1(id);
};
