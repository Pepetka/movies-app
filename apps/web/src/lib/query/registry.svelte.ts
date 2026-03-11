import { SvelteSet } from 'svelte/reactivity';

import { logger } from '$lib/utils/logger';

import type { QueryActions, RegistryEntry } from './types';

class QueryRegistry {
	private _queries = new Map<string, RegistryEntry>();
	private _tagIndex = $state.raw(new Map<string, Set<string>>());
	private _debug = $state(false);

	setDebug(enabled: boolean): void {
		this._debug = enabled;
	}

	get debug(): boolean {
		return this._debug;
	}

	register(key: unknown[], tags: string[], actions: QueryActions, debug = false): () => void {
		const serializedKey = this._serialize(key);

		if (debug || this._debug) {
			logger.debug('QueryRegistry', 'Registered', { key, tags });
		}

		this._queries.set(serializedKey, { key, tags, actions });

		for (const tag of tags) {
			let set = this._tagIndex.get(tag);
			if (!set) {
				set = new SvelteSet();
				this._tagIndex.set(tag, set);
			}
			set.add(serializedKey);
		}

		return () => this._unregister(serializedKey, tags, debug);
	}

	invalidateByTag(tag: string): void {
		if (this._debug) {
			logger.debug('QueryRegistry', 'Invalidate by tag', { tag });
		}

		const keys = this._tagIndex.get(tag);
		if (keys) {
			for (const key of keys) {
				void this._queries.get(key)?.actions.fetch();
			}
		}
	}

	invalidateByKey(prefix: unknown[]): void {
		if (this._debug) {
			logger.debug('QueryRegistry', 'Invalidate by key prefix', { prefix });
		}

		for (const entry of this._queries.values()) {
			if (this._keyMatchesPrefix(entry.key, prefix)) {
				void entry.actions.fetch();
			}
		}
	}

	resetAll(): void {
		if (this._debug) {
			logger.debug('QueryRegistry', 'Reset all queries');
		}

		for (const entry of this._queries.values()) {
			entry.actions.reset();
		}
	}

	private _unregister(serializedKey: string, tags: string[], debug: boolean): void {
		this._queries.delete(serializedKey);
		for (const tag of tags) {
			const set = this._tagIndex.get(tag);
			if (set) {
				set.delete(serializedKey);
				if (set.size === 0) {
					this._tagIndex.delete(tag);
				}
			}
		}

		if (debug || this._debug) {
			logger.debug('QueryRegistry', 'Unregistered', { key: serializedKey });
		}
	}

	private _keyMatchesPrefix(key: unknown[], prefix: unknown[]): boolean {
		if (prefix.length > key.length) return false;
		return prefix.every((p, i) => this._serialize(p) === this._serialize(key[i]));
	}

	private _serialize(value: unknown): string {
		return JSON.stringify(value);
	}
}

export const queryRegistry = new QueryRegistry();
