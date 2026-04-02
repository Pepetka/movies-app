import { untrack } from 'svelte';

import type {
	AcceptInviteResponseDto,
	GeneratedInviteTokenResponseDto,
	InviteInfoResponseDto,
	InviteTokenResponseDto
} from '$lib/api/generated/types';
import {
	createMutation,
	createQuery,
	type FetchStatus,
	type MutationResult,
	type PostStatus,
	type QueryResult
} from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';
import { HttpError } from '$lib/api/errors';

import {
	acceptInvite as acceptInviteApi,
	getInviteInfo as getInviteInfoApi,
	getInviteToken as getInviteTokenApi,
	generateInviteToken as generateInviteTokenApi
} from '../api';

class InviteStore extends BaseStore {
	private readonly _query: QueryResult<InviteInfoResponseDto, string>;
	private readonly _tokenQuery: QueryResult<InviteTokenResponseDto, number>;
	private readonly _acceptMutation: MutationResult<AcceptInviteResponseDto, string>;
	private readonly _generateMutation: MutationResult<GeneratedInviteTokenResponseDto, number>;

	constructor() {
		super();

		this._query = createQuery<InviteInfoResponseDto, string>({
			key: ['invite'],
			tags: ['invite'],
			fetcher: (signal, token) => {
				if (!token) throw new Error('No invite token');
				return getInviteInfoApi(token, signal);
			},
			debug: !__IS_PROD__
		});

		this._tokenQuery = createQuery<InviteTokenResponseDto, number>({
			key: ['invite-token'],
			tags: ['invite-token'],
			fetcher: (signal, groupId) => {
				if (!groupId) throw new Error('No group id');
				return getInviteTokenApi(groupId, signal);
			},
			debug: !__IS_PROD__
		});

		this._acceptMutation = createMutation<AcceptInviteResponseDto, string>({
			key: ['invite', 'accept'],
			tags: ['groups', 'group-members'],
			mutator: (token) => acceptInviteApi(token),
			invalidateKeys: (data) => (data ? [['invite'], ['group', data.groupId]] : [['invite']]),
			debug: !__IS_PROD__
		});

		this._generateMutation = createMutation<GeneratedInviteTokenResponseDto, number>({
			key: ['invite', 'generate'],
			tags: ['invite-token'],
			mutator: (groupId) => generateInviteTokenApi(groupId),
			debug: !__IS_PROD__
		});
	}

	// === Query getters ===

	get inviteInfo(): InviteInfoResponseDto | null {
		return this._query.data ?? null;
	}

	get status(): FetchStatus {
		return this._query.status;
	}

	get isLoading(): boolean {
		return this._query.isLoading;
	}

	get isLoaded(): boolean {
		return this._query.isLoaded;
	}

	get isFetching(): boolean {
		return this._query.isFetching;
	}

	get isError(): boolean {
		return this._query.isError;
	}

	get error(): string | null {
		if (!this._query.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки приглашения');
	}

	get isTokenNotFound(): boolean {
		const error = this._query.error;
		return error instanceof HttpError && error.status === 404;
	}

	// === Query methods ===

	async fetchInviteInfo(token: string): Promise<void> {
		return untrack(async () => {
			if (this._query.isCurrentKey(['invite', token]) && (this.isLoaded || this.isFetching)) return;
			await this._query.revalidate(['invite', token], token);
		});
	}

	// === Token query getters ===

	get isTokenLoading(): boolean {
		return this._tokenQuery.isLoading;
	}

	get isTokenLoaded(): boolean {
		return this._tokenQuery.isLoaded;
	}

	get isTokenFetching(): boolean {
		return this._tokenQuery.isFetching;
	}

	get isTokenError(): boolean {
		return this._tokenQuery.isError;
	}

	// === Token query methods ===

	async fetchInviteToken(groupId: number): Promise<void> {
		return untrack(async () => {
			if (
				this._tokenQuery.isCurrentKey(['invite-token', groupId]) &&
				(this.isTokenLoaded || this._tokenQuery.isFetching)
			)
				return;
			await this._tokenQuery.revalidate(['invite-token', groupId], groupId);
		});
	}

	// === Accept mutation ===

	get acceptStatus(): PostStatus {
		return this._acceptMutation.status;
	}

	get isAccepting(): boolean {
		return this._acceptMutation.isSubmitting;
	}

	get isAcceptSuccess(): boolean {
		return this._acceptMutation.isSuccess;
	}

	get acceptError(): string | null {
		if (!this._acceptMutation.error) return null;
		return this._extractErrorMessage(this._acceptMutation.error, 'Ошибка принятия приглашения');
	}

	get acceptedGroupId(): number | null {
		return this._acceptMutation.data?.groupId ?? null;
	}

	get isAlreadyMember(): boolean {
		const error = this._acceptMutation.error;
		return error instanceof HttpError && error.status === 409;
	}

	async acceptInvite(token: string): Promise<AcceptInviteResponseDto | null> {
		return untrack(() => this._acceptMutation.mutate(token));
	}

	resetAccept(): void {
		this._acceptMutation.reset();
	}

	// === Generate mutation ===

	get generateStatus(): PostStatus {
		return this._generateMutation.status;
	}

	get isGenerateSuccess(): boolean {
		return this._generateMutation.isSuccess;
	}

	get generateError(): string | null {
		if (!this._generateMutation.error) return null;
		return this._extractErrorMessage(this._generateMutation.error, 'Ошибка создания ссылки');
	}

	get inviteToken(): string | null {
		return this._tokenQuery.data?.inviteToken ?? null;
	}

	get isGenerating(): boolean {
		return this._generateMutation.isSubmitting;
	}

	async generateInvite(groupId: number): Promise<GeneratedInviteTokenResponseDto | null> {
		return untrack(() => this._generateMutation.mutate(groupId));
	}

	resetGenerate(): void {
		this._generateMutation.reset();
	}

	// === Reset ===

	reset(): void {
		this._query.reset();
		this._tokenQuery.reset();
	}

	resetForm(): void {
		this._acceptMutation.reset();
		this._generateMutation.reset();
	}
}

export const inviteStore = new InviteStore();
