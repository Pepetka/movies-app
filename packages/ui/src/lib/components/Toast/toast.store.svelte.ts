import type { ToastItem, ToastOptions } from './Toast.types.svelte';

class ToastStore {
	private _toasts = $state<ToastItem[]>([]);
	private _maxToasts = $state(3);

	get toasts(): ToastItem[] {
		return this._toasts;
	}

	get maxToasts(): number {
		return this._maxToasts;
	}

	setMaxToasts(n: number): void {
		this._maxToasts = n;
	}

	private _generateId(): string {
		return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	}

	add(options: ToastOptions): string {
		const id = this._generateId();
		const toast: ToastItem = {
			id,
			message: options.message,
			type: options.type ?? 'info',
			duration: options.duration ?? 4000,
			dismissible: options.dismissible ?? true,
			action: options.action
		};

		if (this._toasts.length >= this._maxToasts) {
			this._toasts = this._toasts.slice(1);
		}

		this._toasts = [...this._toasts, toast];
		return id;
	}

	dismiss(id: string): void {
		this._toasts = this._toasts.filter((t) => t.id !== id);
	}

	clear(): void {
		this._toasts = [];
	}

	success(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
		return this.add({ ...options, message, type: 'success' });
	}

	error(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
		return this.add({ ...options, message, type: 'error' });
	}

	info(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
		return this.add({ ...options, message, type: 'info' });
	}

	warning(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
		return this.add({ ...options, message, type: 'warning' });
	}
}

export const toast = new ToastStore();
export type ToastStoreClass = ToastStore;
