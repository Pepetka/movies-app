import {
	invitesControllerAcceptInviteV1,
	invitesControllerGetInviteInfoV1,
	groupsControllerGenerateInviteV1,
	groupsControllerGetInviteTokenV1
} from '$lib/api/generated/api';
import type {
	AcceptInviteResponseDto,
	InviteInfoResponseDto,
	InviteTokenResponseDto
} from '$lib/api/generated/types';

export const getInviteInfo = (
	token: string,
	signal?: AbortSignal
): Promise<InviteInfoResponseDto> => {
	return invitesControllerGetInviteInfoV1(token, { signal });
};

export const acceptInvite = (token: string): Promise<AcceptInviteResponseDto> => {
	return invitesControllerAcceptInviteV1(token);
};

export const getInviteToken = (
	groupId: number,
	signal?: AbortSignal
): Promise<InviteTokenResponseDto> => {
	return groupsControllerGetInviteTokenV1(groupId, { signal });
};

export const generateInviteToken = (groupId: number): Promise<InviteTokenResponseDto> => {
	return groupsControllerGenerateInviteV1(groupId);
};
