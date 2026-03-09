import { toast } from '@repo/ui';

import type { AuthLoginDto, AuthRegisterDto, UserResponseDto } from '$lib/api/generated/types';
import { createQuery, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	getCurrentUser,
	login as apiLogin,
	logout as apiLogout,
	register as apiRegister
} from './api';
import { validateLoginForm, validateRegisterForm } from './validation.svelte';
import type { AuthStatus, ValidationResult } from './types';

class AuthStore extends BaseStore {
	status = $state<AuthStatus>('loading');
	error = $state<string | null>(null);
	isInitialized = $state(false);

	private _userQuery: QueryResult<UserResponseDto> | null = null;
	private _checkAuthPromise: Promise<void> | null = null;

	private _getQuery(): QueryResult<UserResponseDto> {
		if (!this._userQuery) {
			this._userQuery = createQuery<UserResponseDto>({
				key: ['currentUser'],
				tags: ['user'],
				fetcher: (signal) => getCurrentUser(signal),
				enabled: false,
				debug: import.meta.env.DEV
			});
		}
		return this._userQuery;
	}

	private _updateStatusFromQuery(): void {
		const query = this._userQuery;
		if (!query) return;

		if (query.data) {
			this.status = 'authenticated';
			this.error = null;
		} else if (query.error) {
			this.status = 'unauthenticated';
		}
	}

	get user(): UserResponseDto | null {
		return this._userQuery?.data ?? null;
	}

	get isAuthenticated(): boolean {
		return this.status === 'authenticated' && this._userQuery?.data !== null;
	}

	get isLoading(): boolean {
		return this.status === 'loading' || this._userQuery?.isFetching === true;
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
		this.status = 'loading';
		const query = this._getQuery();
		await query.refetch();
		this._updateStatusFromQuery();
		this.isInitialized = true;
	}

	async login(data: unknown): Promise<ValidationResult<AuthLoginDto>> {
		const validation = validateLoginForm(data);
		if (!validation.isValid || !validation.data) return validation;

		try {
			this.status = 'loading';
			await apiLogin(validation.data);
			const query = this._getQuery();
			await query.refetch();
			this._updateStatusFromQuery();
			toast.success('Добро пожаловать!');
		} catch (error) {
			this.status = 'unauthenticated';
			this.error = this._extractErrorMessage(error, 'Ошибка входа');
			toast.error(this.error);
			throw error;
		}

		return { isValid: true, data: validation.data, errors: {} };
	}

	async register(data: unknown): Promise<ValidationResult<AuthRegisterDto>> {
		const validation = validateRegisterForm(data);
		if (!validation.isValid || !validation.data) return validation;

		try {
			this.status = 'loading';
			const { name, email, password } = validation.data;
			await apiRegister({ name, email, password });
			const query = this._getQuery();
			await query.refetch();
			this._updateStatusFromQuery();
			toast.success('Регистрация успешна!');
		} catch (error) {
			this.status = 'unauthenticated';
			this.error = this._extractErrorMessage(error, 'Ошибка регистрации');
			toast.error(this.error);
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
			this._userQuery?.reset();
			this.status = 'unauthenticated';
			this.error = null;
		}
	}

	clearError(): void {
		this.error = null;
	}

	destroy(): void {
		this._userQuery?.reset();
		this._userQuery = null;
		this._checkAuthPromise = null;
		this.status = 'loading';
		this.error = null;
		this.isInitialized = false;
	}
}

export const authStore = new AuthStore();
