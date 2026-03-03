import { logger } from '$lib/utils/logger';

import type { QueryActions, RegistryEntry } from './types';

class QueryRegistry {
	private _queries = new Map<string, RegistryEntry>();
	private _tagIndex = new Map<string, Set<string>>();
	private _debug = $state(false);

	setDebug(enabled: boolean): void {
		this._debug = enabled;
	}

	get debug(): boolean {
		return this._debug;
	}

	register(key: unknown[], tags: string[], actions: QueryActions): () => void {
		const serializedKey = this._serialize(key);

		this._log('Registered', { key, tags });

		this._queries.set(serializedKey, { key, tags, actions });

		for (const tag of tags) {
			if (!this._tagIndex.has(tag)) {
				this._tagIndex.set(tag, new Set());
			}
			this._tagIndex.get(tag)!.add(serializedKey);
		}

		return () => this._unregister(serializedKey, tags);
	}

	invalidateByTag(tag: string): void {
		this._log('Invalidate by tag', { tag });

		const keys = this._tagIndex.get(tag);
		if (keys) {
			for (const key of keys) {
				void this._queries.get(key)?.actions.refetch();
			}
		}
	}

	invalidateByKey(prefix: unknown[]): void {
		this._log('Invalidate by key prefix', { prefix });

		for (const entry of this._queries.values()) {
			if (this._keyMatchesPrefix(entry.key, prefix)) {
				void entry.actions.refetch();
			}
		}
	}

	private _unregister(serializedKey: string, tags: string[]): void {
		this._queries.delete(serializedKey);
		for (const tag of tags) {
			this._tagIndex.get(tag)?.delete(serializedKey);
		}
	}

	private _keyMatchesPrefix(key: unknown[], prefix: unknown[]): boolean {
		if (prefix.length > key.length) return false;
		return prefix.every((p, i) => this._serialize(p) === this._serialize(key[i]));
	}

	private _serialize(value: unknown): string {
		return JSON.stringify(value);
	}

	private _log(message: string, meta?: Record<string, unknown>): void {
		if (this._debug) {
			logger.debug('QueryRegistry', message, meta);
		}
	}
}

export const queryRegistry = new QueryRegistry();
