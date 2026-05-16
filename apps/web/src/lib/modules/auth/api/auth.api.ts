import {
	authControllerLoginV1,
	authControllerLogoutV1,
	authControllerRefreshV1,
	userControllerGetMeV1,
	userControllerUpdateV1
} from '$lib/api/generated/api';
import type {
	AuthLoginDto,
	AuthResponseDto,
	AuthProvider,
	UserResponseDto,
	UserUpdateDto
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

export const updateUser = async (
	id: number,
	data: UserUpdateDto,
	signal?: AbortSignal
): Promise<UserResponseDto> => {
	return userControllerUpdateV1(id, data, { signal });
};

export const refreshTokens = async (): Promise<AuthResponseDto> => {
	const response = await authControllerRefreshV1();
	httpClient.setAccessToken(response.accessToken);
	return response;
};

export const buildOAuthRedirectUrl = (provider: AuthProvider, redirect: string): string => {
	const base = __API_URL__ || (typeof window !== 'undefined' ? window.location.origin : '');
	const url = new URL(`/api/v1/auth/oauth/${provider}`, base || 'http://localhost');
	url.searchParams.set('redirect', redirect);
	return base ? url.toString() : url.pathname + url.search;
};
