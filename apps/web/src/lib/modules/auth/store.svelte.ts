import { toast } from '@repo/ui';

import type { AuthLoginDto, AuthRegisterDto, UserResponseDto } from '$lib/api/generated/types';
import { createQuery, queryRegistry, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	getCurrentUser,
	login as apiLogin,
	logout as apiLogout,
	register as apiRegister
} from './api';
import { validateLoginForm, validateRegisterForm } from './validation.svelte';
import type { AuthStatus } from './types';

class AuthStore extends BaseStore {
	private readonly _query: QueryResult<UserResponseDto>;
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
	}

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
		return this._query.isFetching;
	}

	async checkAuth(): Promise<void> {
		if (this._checkAuthPromise) return this._checkAuthPromise;

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

	async login(
		data: unknown
	): Promise<{ isValid: boolean; data?: AuthLoginDto; errors: Record<string, string> }> {
		const validation = validateLoginForm(data);
		if (!validation.isValid || !validation.data)
			return { isValid: false, errors: validation.errors };

		try {
			await apiLogin(validation.data);
			await this._query.fetch();
			toast.success('Добро пожаловать!');
		} catch (error) {
			const message = this._extractErrorMessage(error, 'Ошибка входа');
			toast.error(message);
			throw error;
		}

		return { isValid: true, data: validation.data, errors: {} };
	}

	async register(
		data: unknown
	): Promise<{ isValid: boolean; data?: AuthRegisterDto; errors: Record<string, string> }> {
		const validation = validateRegisterForm(data);
		if (!validation.isValid || !validation.data)
			return { isValid: false, errors: validation.errors };

		try {
			const { name, email, password } = validation.data;
			await apiRegister({ name, email, password });
			await this._query.fetch();
			toast.success('Регистрация успешна!');
		} catch (error) {
			const message = this._extractErrorMessage(error, 'Ошибка регистрации');
			toast.error(message);
			throw error;
		}

		return { isValid: true, data: validation.data, errors: {} };
	}

	async logout(): Promise<void> {
		try {
			await apiLogout();
		} catch (error) {
			this._log('error', 'Logout failed', { error });
			toast.error(this._extractErrorMessage(error, 'Ошибка выхода'));
			throw error;
		} finally {
			queryRegistry.resetAll();
		}
	}

	reset(): void {
		this._query.reset();
		this._checkAuthPromise = null;
		this.isInitialized = false;
	}
}

export const authStore = new AuthStore();
