import {
	createMutation,
	createQuery,
	queryRegistry,
	type MutationResult,
	type QueryResult
} from '$lib/query';
import type { AuthLoginDto, AuthRegisterDto, UserResponseDto } from '$lib/api/generated/types';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	getCurrentUser,
	login as apiLogin,
	logout as apiLogout,
	register as apiRegister
} from '../api';
import type { AuthStatus } from '../types';

class AuthStore extends BaseStore {
	private readonly _query: QueryResult<UserResponseDto>;
	private readonly _loginMutation: MutationResult<void, AuthLoginDto>;
	private readonly _registerMutation: MutationResult<void, AuthRegisterDto>;
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

		this._registerMutation = createMutation<void, AuthRegisterDto>({
			key: ['auth', 'register'],
			tags: ['user'],
			mutator: async (data) => {
				await apiRegister(data);
			},
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
		await this._loginMutation.mutate(data);
	}

	// === Register mutation ===

	get isRegistering(): boolean {
		return this._registerMutation.isSubmitting;
	}

	get isRegisterSuccess(): boolean {
		return this._registerMutation.isSuccess;
	}

	get registerError(): string | null {
		if (!this._registerMutation.error) return null;
		return this._extractErrorMessage(this._registerMutation.error, 'Ошибка регистрации');
	}

	async register(data: AuthRegisterDto): Promise<void> {
		await this._registerMutation.mutate(data);
	}

	// === Logout ===

	async logout(): Promise<void> {
		try {
			await apiLogout();
		} catch (error) {
			this._log('error', 'Logout failed', { error });
			throw error;
		} finally {
			queryRegistry.resetAll();
		}
	}

	// === Check Auth ===

	async checkAuth(): Promise<void> {
		if (this._checkAuthPromise) return this._checkAuthPromise;
		if (this.user) return;

		this._checkAuthPromise = this._doCheckAuth();
		try {
			await this._checkAuthPromise;
		} finally {
			this._checkAuthPromise = null;
		}
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
		this._registerMutation.reset();
	}
}

export const authStore = new AuthStore();
