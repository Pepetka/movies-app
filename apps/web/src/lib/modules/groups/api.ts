import {
	groupsControllerFindAllV1,
	groupsControllerCreateV1,
	groupsControllerUpdateV1,
	groupsControllerFindOneV1
} from '$lib/api/generated/api';
import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';

export const getGroups = async (signal?: AbortSignal): Promise<GroupResponseDto[]> => {
	return groupsControllerFindAllV1({ signal });
};

export const getGroup = async (id: number, signal?: AbortSignal): Promise<GroupResponseDto> => {
	return groupsControllerFindOneV1(id, { signal });
};

export const createGroup = async (
	data: GroupCreateDto,
	signal?: AbortSignal
): Promise<GroupResponseDto> => {
	return groupsControllerCreateV1(data, { signal });
};

export const updateGroup = async (
	id: number,
	data: GroupUpdateDto,
	signal?: AbortSignal
): Promise<GroupResponseDto> => {
	return groupsControllerUpdateV1(id, data, { signal });
};
