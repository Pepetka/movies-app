import {
	authControllerLoginV1,
	authControllerLogoutV1,
	authControllerOauthLinkInitV1,
	authControllerRefreshV1,
	userControllerGetMeV1
} from '$lib/api/generated/api';
import type {
	AuthLoginDto,
	AuthResponseDto,
	AuthProvider,
	UserResponseDto
} from '$lib/api/generated/types';
import { httpClient } from '$lib/api/client';

export const login = async (data: AuthLoginDto, signal?: AbortSignal): Promise<void> => {
	const response = await authControllerLoginV1(data, { signal });
	httpClient.setAccessToken(response.accessToken);
};

export const logout = async (): Promise<void> => {
	await authControllerLogoutV1();
	httpClient.clearTokens();
};

export const getCurrentUser = async (signal?: AbortSignal): Promise<UserResponseDto> => {
	return userControllerGetMeV1({ signal });
};

export const refreshTokens = async (): Promise<AuthResponseDto> => {
	const response = await authControllerRefreshV1();
	httpClient.setAccessToken(response.accessToken);
	return response;
};

export const initLinkProvider = async (provider: AuthProvider): Promise<string> => {
	const { authUrl } = await authControllerOauthLinkInitV1(provider);
	return authUrl;
};

export const buildOAuthRedirectUrl = (provider: AuthProvider, redirect: string): string => {
	return `${__API_URL__}/api/v1/auth/oauth/${provider}?redirect=${encodeURIComponent(redirect)}`;
};
