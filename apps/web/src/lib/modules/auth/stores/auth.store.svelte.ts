import { untrack } from 'svelte';

import {
	createMutation,
	createQuery,
	queryRegistry,
	type MutationResult,
	type QueryResult
} from '$lib/query';
import type { AuthLoginDto, UserResponseDto, UserUpdateDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	getCurrentUser,
	login as apiLogin,
	logout as apiLogout,
	refreshTokens as apiRefreshTokens,
	updateUser as apiUpdateUser
} from '../api';
import type { AuthStatus } from '../types';

class AuthStore extends BaseStore {
	private readonly _query: QueryResult<UserResponseDto>;
	private readonly _loginMutation: MutationResult<void, AuthLoginDto>;
	private readonly _oauthSuccessMutation: MutationResult<void, void>;
	private readonly _updateProfileMutation: MutationResult<
		UserResponseDto,
		{ id: number; data: UserUpdateDto }
	>;
	private _checkAuthPromise: Promise<void> | null = null;

	isInitialized = $state(false);

	constructor() {
		super();

		this._query = createQuery<UserResponseDto>({
			key: ['currentUser'],
			tags: ['user'],
			fetcher: (signal) => getCurrentUser(signal),
			debug: !__IS_PROD__
		});

		this._loginMutation = createMutation<void, AuthLoginDto>({
			key: ['auth', 'login'],
			tags: ['user'],
			mutator: async (data) => {
				await apiLogin(data);
			},
			debug: !__IS_PROD__
		});

		this._oauthSuccessMutation = createMutation<void, void>({
			key: ['auth', 'oauthSuccess'],
			tags: ['user'],
			mutator: async () => {
				await apiRefreshTokens();
			},
			debug: !__IS_PROD__
		});

		this._updateProfileMutation = createMutation<
			UserResponseDto,
			{ id: number; data: UserUpdateDto }
		>({
			key: ['auth', 'updateProfile'],
			tags: ['user'],
			mutator: ({ id, data }) => apiUpdateUser(id, data),
			debug: !__IS_PROD__
		});
	}

	// === Query геттеры ===

	get user(): UserResponseDto | null {
		return this._query.data ?? null;
	}

	get status(): AuthStatus {
		if (this._query.isFetching && !this.user) return 'loading';
		if (this._query.error) return 'unauthenticated';
		if (this.user) return 'authenticated';
		return 'unauthenticated';
	}

	get error(): string | null {
		if (!this._query.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка авторизации');
	}

	get isAuthenticated(): boolean {
		return this.user !== null;
	}

	get isLoading(): boolean {
		return this._query.isLoading;
	}

	// === Login mutation ===

	get isLoggingIn(): boolean {
		return this._loginMutation.isSubmitting;
	}

	get isLoginSuccess(): boolean {
		return this._loginMutation.isSuccess;
	}

	get loginError(): string | null {
		if (!this._loginMutation.error) return null;
		return this._extractErrorMessage(this._loginMutation.error, 'Ошибка входа');
	}

	async login(data: AuthLoginDto): Promise<void> {
		await untrack(() => this._loginMutation.mutate(data));
	}

	// === OAuth success mutation ===

	get isHandlingOAuthSuccess(): boolean {
		return this._oauthSuccessMutation.isSubmitting;
	}

	get isOAuthSuccess(): boolean {
		return this._oauthSuccessMutation.isSuccess;
	}

	get oauthError(): string | null {
		if (!this._oauthSuccessMutation.error) return null;
		return this._extractErrorMessage(this._oauthSuccessMutation.error, 'Ошибка OAuth');
	}

	async handleOAuthSuccess(): Promise<void> {
		await untrack(() => this._oauthSuccessMutation.mutate());
	}

	// === Update profile mutation ===

	get isUpdatingProfile(): boolean {
		return this._updateProfileMutation.isSubmitting;
	}

	get isUpdateProfileSuccess(): boolean {
		return this._updateProfileMutation.isSuccess;
	}

	get updateProfileError(): string | null {
		if (!this._updateProfileMutation.error) return null;
		return this._extractErrorMessage(
			this._updateProfileMutation.error,
			'Ошибка обновления профиля'
		);
	}

	async updateProfile(id: number, data: UserUpdateDto): Promise<UserResponseDto | null> {
		return untrack(() => this._updateProfileMutation.mutate({ id, data }));
	}

	resetProfileForm(): void {
		this._updateProfileMutation.reset();
	}

	// === Logout ===

	async logout(): Promise<void> {
		await untrack(async () => {
			try {
				await apiLogout();
			} catch (error) {
				this._log('error', 'Logout failed', { error });
				throw error;
			} finally {
				queryRegistry.resetAll();
			}
		});
	}

	// === Check Auth ===

	async checkAuth(): Promise<void> {
		return untrack(async () => {
			if (this._checkAuthPromise) return this._checkAuthPromise;
			if (this.user) return;

			this._checkAuthPromise = this._doCheckAuth();
			try {
				await this._checkAuthPromise;
			} finally {
				this._checkAuthPromise = null;
			}
		});
	}

	private async _doCheckAuth(): Promise<void> {
		await this._query.fetch();
		this.isInitialized = true;
	}

	// === Reset ===

	reset(): void {
		this._query.reset();
		this._checkAuthPromise = null;
		this.isInitialized = false;
	}

	resetForm(): void {
		this._loginMutation.reset();
		this._oauthSuccessMutation.reset();
		this._updateProfileMutation.reset();
	}
}

export const authStore = new AuthStore();
