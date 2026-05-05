import {
	authControllerLoginV1,
	authControllerLogoutV1,
	authControllerOauthLinkInitV1,
	authControllerRegisterV1,
	userControllerGetMeV1
} from '$lib/api/generated/api';
import type { AuthLoginDto, AuthRegisterDto, UserResponseDto } from '$lib/api/generated/types';
import { httpClient } from '$lib/api/client';

export type AuthProvider = Parameters<typeof authControllerOauthLinkInitV1>[0];

export const login = async (data: AuthLoginDto, signal?: AbortSignal): Promise<void> => {
	const response = await authControllerLoginV1(data, { signal });
	httpClient.setAccessToken(response.accessToken);
};

export const register = async (data: AuthRegisterDto, signal?: AbortSignal): Promise<void> => {
	const response = await authControllerRegisterV1(data, { signal });
	httpClient.setAccessToken(response.accessToken);
};

export const logout = async (): Promise<void> => {
	await authControllerLogoutV1();
	httpClient.clearTokens();
};

export const getCurrentUser = async (signal?: AbortSignal): Promise<UserResponseDto> => {
	return userControllerGetMeV1({ signal });
};

export async function initLinkProvider(provider: AuthProvider): Promise<void> {
	const { authUrl } = await authControllerOauthLinkInitV1(provider);
	window.location.href = authUrl;
}
