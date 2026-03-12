import { logger } from '$lib/utils/logger';

import type { MutationOptions, MutationResult, MutationState, PostStatus } from './types';
import { queryRegistry } from './registry.svelte';

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));

class Mutation<T, V> implements MutationResult<T, V> {
	private readonly _mutator: (variables: V) => Promise<T>;
	private readonly _invalidateTags: string[];
	private readonly _invalidateKeys?: (data: T, variables: V) => unknown[][];
	private readonly _debug: boolean;
	private readonly _key: unknown[];

	private _state = $state<MutationState<T>>({
		data: null,
		error: null,
		isSubmitting: false
	});

	private _hasSucceeded = $state(false);

	constructor(options: MutationOptions<T, V>) {
		const { mutator, key, tags = [], invalidateKeys, debug = false } = options;

		this._mutator = mutator;
		this._key = key;
		this._invalidateTags = tags;
		this._invalidateKeys = invalidateKeys;
		this._debug = debug;

		queryRegistry.onReset(() => this.reset());
	}

	get data(): T | null {
		return this._state.data;
	}

	get error(): Error | null {
		return this._state.error;
	}

	get isSubmitting(): boolean {
		return this._state.isSubmitting;
	}

	get isError(): boolean {
		return this._state.error !== null;
	}

	get isSuccess(): boolean {
		return this._hasSucceeded && !this._state.isSubmitting && !this.isError;
	}

	get status(): PostStatus {
		if (this._state.isSubmitting) return 'submitting';
		if (this._state.error) return 'error';
		if (this._hasSucceeded) return 'success';
		return 'idle';
	}

	async mutate(variables: V): Promise<T | null> {
		this._state.isSubmitting = true;
		this._state.error = null;
		this._state.hasSucceeded = false;

		if (this._debug) {
			logger.debug('Mutation', 'Starting', { key: this._key, variables });
		}

		try {
			const data = await this._mutator(variables);
			this._state.data = data;
			this._state.hasSucceeded = true;

			if (this._debug) {
				logger.debug('Mutation', 'Success', { key: this._key, data });
			}

			this._invalidate(variables, data);

			return data;
		} catch (e) {
			const error = toError(e);
			this._state.error = error;

			if (this._debug) {
				logger.error('Mutation', 'Error', { key: this._key, error });
			}

			return null;
		} finally {
			this._state.isSubmitting = false;
		}
	}

	reset(): void {
		this._state.data = null;
		this._state.error = null;
		this._state.isSubmitting = false;
		this._state.hasSucceeded = false;
	}

	private _invalidate(variables: V, data: T): void {
		for (const tag of this._invalidateTags) {
			queryRegistry.invalidateByTag(tag);
		}

		if (this._invalidateKeys) {
			const keys = this._invalidateKeys(data, variables);
			for (const key of keys) {
				queryRegistry.invalidateByKey(key);
			}
		}
	}
}

export const createMutation = <T, V>(options: MutationOptions<T, V>): MutationResult<T, V> => {
	return new Mutation(options);
};
