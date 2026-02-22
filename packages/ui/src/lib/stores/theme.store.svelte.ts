import { browser } from '$app/environment';

export type PersistedTheme = 'system' | 'dark' | 'light';
export type Theme = Exclude<PersistedTheme, 'system'>;

class ThemeStore {
	private _persistedTheme = $state<PersistedTheme>('system');
	private _systemTheme = $state<Theme>('light');

	readonly STORAGE_KEY = 'theme';
	readonly MEDIA = '(prefers-color-scheme: dark)';
	readonly ALLOWED_MODES: PersistedTheme[] = ['system', 'dark', 'light'];
	readonly ROOT_QS = '.root';

	constructor() {
		if (!browser) return;

		const mediaQuery = window.matchMedia(this.MEDIA);
		this._systemTheme = mediaQuery.matches ? 'dark' : 'light';

		mediaQuery.addEventListener('change', (e) => {
			this._systemTheme = e.matches ? 'dark' : 'light';
			this._applyTheme();
		});

		const persistedTheme = localStorage.getItem(this.STORAGE_KEY) as PersistedTheme | null;
		if (persistedTheme && this.ALLOWED_MODES.includes(persistedTheme)) {
			this._persistedTheme = persistedTheme;
		}

		this._applyTheme();
	}

	get theme(): Theme {
		return this._persistedTheme === 'system' ? this._systemTheme : this._persistedTheme;
	}

	get persisted(): PersistedTheme {
		return this._persistedTheme;
	}

	setTheme(newTheme: PersistedTheme): void {
		if (!this.ALLOWED_MODES.includes(newTheme)) return;
		this._persistedTheme = newTheme;

		if (browser) {
			localStorage.setItem(this.STORAGE_KEY, newTheme);
			this._applyTheme();
		}
	}

	toggle(): void {
		const newTheme = this.theme === 'dark' ? 'light' : 'dark';
		this._persistedTheme = newTheme;

		if (browser) {
			localStorage.setItem(this.STORAGE_KEY, newTheme);
			this._applyTheme();
		}
	}

	private _applyTheme(): void {
		const root = (document.querySelector(this.ROOT_QS) ?? document.documentElement) as HTMLElement;
		root.dataset.theme = this.theme;
		root.style.colorScheme = this.theme;
	}
}

export const themeStore = new ThemeStore();
