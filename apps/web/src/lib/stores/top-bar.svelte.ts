import type { Icon as IconType } from '@lucide/svelte';

export interface TopBarAction {
	Icon: typeof IconType;
	label: string;
	onclick: () => void;
}

interface TopBarState {
	title?: string;
	showBack?: boolean;
	onBack?: () => void;
	trailingAction?: TopBarAction;
}

class TopBarStore {
	private _state = $state<TopBarState>({});

	get title(): string | undefined {
		return this._state.title;
	}

	get showBack(): boolean {
		return this._state.showBack ?? false;
	}

	get onBack(): (() => void) | undefined {
		return this._state.onBack;
	}

	get trailingAction(): TopBarAction | undefined {
		return this._state.trailingAction;
	}

	configure(config: TopBarState): void {
		this._state = config;
	}

	destroy(): void {
		this._state = {};
	}
}

export const topBarStore = new TopBarStore();
