import {
	authControllerLoginV1,
	authControllerLogoutV1,
	authControllerRegisterV1,
	userControllerGetMeV1
} from '$lib/api/generated/api';
import type { AuthLoginDto, AuthRegisterDto, UserResponseDto } from '$lib/api/generated/types';
import { httpClient } from '$lib/api/client';

export const login = async (data: AuthLoginDto): Promise<void> => {
	const response = await authControllerLoginV1(data);
	httpClient.setAccessToken(response.accessToken);
};

export const register = async (data: AuthRegisterDto): Promise<void> => {
	const response = await authControllerRegisterV1(data);
	httpClient.setAccessToken(response.accessToken);
};

export const logout = async (): Promise<void> => {
	await authControllerLogoutV1();
	httpClient.clearTokens();
};

export const getCurrentUser = async (signal?: AbortSignal): Promise<UserResponseDto> => {
	return userControllerGetMeV1({ signal });
};
