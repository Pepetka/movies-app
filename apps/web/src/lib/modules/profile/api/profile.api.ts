import type { UserResponseDto, UserUpdateDto } from '$lib/api/generated/types';
import { userControllerUpdateV1 } from '$lib/api/generated/api';

export const updateUser = async (
	id: number,
	data: UserUpdateDto,
	signal?: AbortSignal
): Promise<UserResponseDto> => {
	return userControllerUpdateV1(id, data, { signal });
};
